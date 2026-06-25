import { NextResponse } from "next/server";

import { isValidBookingDate } from "@/features/booking/lib/dates";
import {
  calculateAvailableSlots,
  calculateShopWideSlots,
} from "@/features/booking/lib/slots";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopSlug = searchParams.get("shopSlug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId");

  if (!shopSlug || !serviceId || !date) {
    return NextResponse.json(
      { error: "Thiếu tham số shopSlug, serviceId hoặc date." },
      { status: 400 },
    );
  }

  if (!isValidBookingDate(date)) {
    return NextResponse.json({ error: "Ngày không hợp lệ." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, open_time, close_time")
    .eq("slug", shopSlug)
    .maybeSingle();

  if (shopError || !shop) {
    return NextResponse.json({ error: "Không tìm thấy cửa hàng." }, { status: 404 });
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, duration_minutes, is_active")
    .eq("id", serviceId)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (serviceError || !service || !service.is_active) {
    return NextResponse.json({ error: "Dịch vụ không hợp lệ." }, { status: 400 });
  }

  const { data: staffRows, error: staffError } = await supabase
    .from("staff")
    .select("id, name, staff_schedules(day_of_week, start_time, end_time)")
    .eq("shop_id", shop.id)
    .eq("is_active", true);

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  const schedules = (staffRows ?? []).flatMap((member) =>
    (member.staff_schedules ?? []).map((schedule) => ({
      staff_id: member.id,
      staff_name: member.name,
      day_of_week: schedule.day_of_week ?? 0,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    })),
  );

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("staff_id, start_time, end_time")
    .eq("shop_id", shop.id)
    .eq("booking_date", date)
    .neq("status", "cancelled");

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const slotInput = {
    date,
    serviceDurationMinutes: service.duration_minutes,
    shopOpenTime: shop.open_time ?? "08:00",
    shopCloseTime: shop.close_time ?? "20:00",
    existingBookings: bookings ?? [],
  };

  const slots =
    schedules.length > 0
      ? calculateAvailableSlots({
          ...slotInput,
          schedules,
          staffId: staffId || null,
        })
      : staffId
        ? []
        : calculateShopWideSlots(slotInput);

  return NextResponse.json({
    slots,
    meta: {
      hasStaffSchedules: schedules.length > 0,
    },
  });
}
