import { NextResponse } from "next/server";

import { createPublicBooking } from "@/features/booking/actions";
import { isValidBookingDate } from "@/features/booking/lib/dates";
import type { PublicBookingFormData } from "@/features/booking/types";

export async function POST(request: Request) {
  let body: PublicBookingFormData;

  try {
    body = (await request.json()) as PublicBookingFormData;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const requiredFields: (keyof PublicBookingFormData)[] = [
    "shop_id",
    "service_id",
    "customer_name",
    "customer_phone",
    "booking_date",
    "start_time",
  ];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { error: `Thiếu trường bắt buộc: ${field}.` },
        { status: 400 },
      );
    }
  }

  if (!isValidBookingDate(body.booking_date)) {
    return NextResponse.json({ error: "Ngày đặt lịch không hợp lệ." }, { status: 400 });
  }

  const result = await createPublicBooking(body);

  if (!result.success) {
    const status = result.error.includes("Khung giờ") ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  void fetch(new URL("/api/notifications", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "booking_created",
      bookingId: result.data.id,
      shopId: body.shop_id,
      customerName: body.customer_name.trim(),
      customerPhone: body.customer_phone.trim(),
      bookingDate: body.booking_date,
      startTime: body.start_time,
      endTime: result.data.end_time,
    }),
  }).catch(() => {
    // Notification delivery is best-effort.
  });

  return NextResponse.json({ id: result.data.id }, { status: 201 });
}
