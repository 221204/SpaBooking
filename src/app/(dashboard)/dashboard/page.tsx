import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  Clock3,
  ExternalLink,
  Store,
} from "lucide-react";

import { NoShopPrompt } from "@/components/shared/NoShopPrompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bookingStatusLabels } from "@/features/booking/types";
import { formatDisplayTime, getTodayDateInHoChiMinh } from "@/features/booking/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { getOwnerShops } from "@/lib/owner-shops";
import type { BookingStatus } from "@/types/database.types";

type UpcomingBooking = {
  id: string;
  customer_name: string;
  booking_date: string;
  start_time: string;
  status: BookingStatus | null;
  shops: { name: string } | null;
};

function StatusBadge({ status }: { status: BookingStatus | null }) {
  const resolvedStatus = status ?? "pending";

  switch (resolvedStatus) {
    case "pending":
      return <Badge variant="secondary">{bookingStatusLabels.pending}</Badge>;
    case "confirmed":
      return <Badge variant="default">{bookingStatusLabels.confirmed}</Badge>;
    case "completed":
      return <Badge variant="outline">{bookingStatusLabels.completed}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{bookingStatusLabels.cancelled}</Badge>;
    default: {
      const _exhaustive: never = resolvedStatus;
      return _exhaustive;
    }
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = getTodayDateInHoChiMinh();
  const { shops, shopIds, error: shopsError } = await getOwnerShops();

  if (shopsError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-start gap-3 py-6 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>Không thể tải dữ liệu cửa hàng: {shopsError}</p>
        </CardContent>
      </Card>
    );
  }

  if (shopIds.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu bằng cách tạo cửa hàng đầu tiên của bạn.
          </p>
        </div>
        <NoShopPrompt feature="dashboard" />
      </div>
    );
  }

  const [todayBookings, pendingBookings, upcomingResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("shop_id", shopIds)
      .eq("booking_date", today),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("shop_id", shopIds)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("id, customer_name, booking_date, start_time, status, shops(name)")
      .in("shop_id", shopIds)
      .gte("booking_date", today)
      .neq("status", "cancelled")
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(8),
  ]);

  const hasError =
    todayBookings.error || pendingBookings.error || upcomingResult.error;
  const upcoming = (upcomingResult.data ?? []) as UpcomingBooking[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan {shops.length} cửa hàng và lịch hẹn hôm nay.
          </p>
        </div>
        <Badge variant="outline">Hôm nay: {today}</Badge>
      </div>

      {hasError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              Không thể tải thống kê dashboard. Vui lòng kiểm tra kết nối
              Supabase và RLS policies.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Cửa hàng</CardTitle>
              <CardDescription>Thuộc tài khoản của bạn</CardDescription>
            </div>
            <Store className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{shops.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Lịch hẹn hôm nay</CardTitle>
              <CardDescription>Theo múi giờ Việt Nam</CardDescription>
            </div>
            <CalendarCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{todayBookings.count ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Chờ xác nhận</CardTitle>
              <CardDescription>Booking trạng thái pending</CardDescription>
            </div>
            <Clock3 className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{pendingBookings.count ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Lịch hẹn sắp tới</CardTitle>
              <CardDescription>8 lịch gần nhất từ hôm nay trở đi</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/bookings" />}>
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chưa có lịch hẹn sắp tới.
              </p>
            ) : (
              upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between gap-3 rounded-lg border px-3 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.shops?.name ?? "—"} · {booking.booking_date} ·{" "}
                      {formatDisplayTime(booking.start_time)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trang đặt lịch công khai</CardTitle>
            <CardDescription>Chia sẻ link cho khách hàng đặt lịch online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{shop.name}</p>
                  <p className="text-sm text-muted-foreground">/{shop.slug}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={`/${shop.slug}`} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  Mở
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="secondary" className="w-full" render={<Link href="/shop" />}>
              Quản lý cửa hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
