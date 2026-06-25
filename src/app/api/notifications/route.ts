import { NextResponse } from "next/server";

type NotificationPayload = {
  type?: string;
  bookingId?: string;
  shopId?: string;
  customerName?: string;
  customerPhone?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
};

export async function POST(request: Request) {
  let body: NotificationPayload;

  try {
    body = (await request.json()) as NotificationPayload;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  // Stub: integrate SMS/email/push provider here.
  console.info("[notifications stub]", body);

  return NextResponse.json({
    ok: true,
    message: "Thông báo đã được ghi nhận (stub).",
  });
}
