"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createBooking,
  deleteBooking,
  updateBooking,
  updateBookingStatus,
} from "@/features/booking/actions";
import {
  bookingStatusLabels,
  type BookingFormData,
  type BookingServiceOption,
  type BookingStaffOption,
  type BookingWithRelations,
  type ShopOption,
} from "@/features/booking/types";
import type { BookingStatus } from "@/types/database.types";

type BookingManagerProps = {
  shops: ShopOption[];
  initialBookings: BookingWithRelations[];
  services: BookingServiceOption[];
  staff: BookingStaffOption[];
};

const ALL_SHOPS = "all";
const ALL_STATUSES = "all";

const selectClassName = cn(
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

function formatTime(time: string) {
  return time.slice(0, 5);
}

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

function createEmptyForm(shopId: string): BookingFormData {
  return {
    shop_id: shopId,
    service_id: "",
    staff_id: null,
    customer_name: "",
    customer_phone: "",
    booking_date: "",
    start_time: "",
    notes: "",
  };
}

export function BookingManager({
  shops,
  initialBookings,
  services,
  staff,
}: BookingManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const defaultShopId = shops[0]?.id ?? "";
  const [form, setForm] = useState<BookingFormData>(() => createEmptyForm(defaultShopId));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shopFilter, setShopFilter] = useState<string>(ALL_SHOPS);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);

  const shopNameById = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops],
  );

  const filteredServices = useMemo(
    () => services.filter((service) => service.shop_id === form.shop_id),
    [services, form.shop_id],
  );

  const filteredStaff = useMemo(
    () => staff.filter((member) => member.shop_id === form.shop_id),
    [staff, form.shop_id],
  );

  const formServiceOptions = useMemo(() => {
    if (!form.service_id || filteredServices.some((service) => service.id === form.service_id)) {
      return filteredServices;
    }

    const booking = initialBookings.find((item) => item.id === editingId);
    const service = booking?.services;

    if (service && service.id === form.service_id) {
      return [
        ...filteredServices,
        {
          id: service.id,
          shop_id: form.shop_id,
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: service.price,
        },
      ];
    }

    return filteredServices;
  }, [filteredServices, form.service_id, form.shop_id, initialBookings, editingId]);

  const formStaffOptions = useMemo(() => {
    if (!form.staff_id || filteredStaff.some((member) => member.id === form.staff_id)) {
      return filteredStaff;
    }

    const booking = initialBookings.find((item) => item.id === editingId);
    const member = booking?.staff;

    if (member && member.id === form.staff_id) {
      return [
        ...filteredStaff,
        { id: member.id, shop_id: form.shop_id, name: member.name },
      ];
    }

    return filteredStaff;
  }, [filteredStaff, form.staff_id, form.shop_id, initialBookings, editingId]);

  const visibleBookings = useMemo(() => {
    return initialBookings.filter((booking) => {
      if (shopFilter !== ALL_SHOPS && booking.shop_id !== shopFilter) {
        return false;
      }
      if (statusFilter !== ALL_STATUSES && booking.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [initialBookings, shopFilter, statusFilter]);

  const stats = useMemo(() => {
    const source =
      shopFilter === ALL_SHOPS
        ? initialBookings
        : initialBookings.filter((booking) => booking.shop_id === shopFilter);

    return {
      total: source.length,
      pending: source.filter((booking) => booking.status === "pending").length,
      confirmed: source.filter((booking) => booking.status === "confirmed").length,
    };
  }, [initialBookings, shopFilter]);

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleShopChange(shopId: string) {
    setForm((current) => ({
      ...current,
      shop_id: shopId,
      service_id: "",
      staff_id: null,
    }));
  }

  function startEdit(booking: BookingWithRelations) {
    setEditingId(booking.id);
    setForm({
      shop_id: booking.shop_id ?? defaultShopId,
      service_id: booking.service_id ?? "",
      staff_id: booking.staff_id,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      start_time: formatTime(booking.start_time),
      notes: booking.notes ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyForm(shopFilter !== ALL_SHOPS ? shopFilter : defaultShopId));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.shop_id || !form.service_id) {
      toast.error("Vui lòng chọn cửa hàng và dịch vụ.");
      return;
    }

    const result = editingId
      ? await updateBooking(editingId, form)
      : await createBooking(form);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(editingId ? "Đã cập nhật lịch hẹn." : "Đã tạo lịch hẹn.");
    resetForm();
    refresh();
  }

  async function handleStatusChange(bookingId: string, status: BookingStatus) {
    const result = await updateBookingStatus(bookingId, status);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã cập nhật trạng thái.");
    refresh();
  }

  async function handleDelete(bookingId: string) {
    if (!window.confirm("Xóa lịch hẹn này?")) return;

    const result = await deleteBooking(bookingId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã xóa lịch hẹn.");
    if (editingId === bookingId) {
      resetForm();
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lịch hẹn</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chờ xác nhận</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đã xác nhận</CardDescription>
            <CardTitle className="text-2xl">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn mới"}</CardTitle>
          <CardDescription>
            Thời gian kết thúc được tính tự động theo thời lượng dịch vụ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="booking-shop">Cửa hàng</Label>
              <select
                id="booking-shop"
                value={form.shop_id}
                onChange={(event) => handleShopChange(event.target.value)}
                required
                className={selectClassName}
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-service">Dịch vụ</Label>
              <select
                id="booking-service"
                value={form.service_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, service_id: event.target.value }))
                }
                required
                disabled={formServiceOptions.length === 0}
                className={selectClassName}
              >
                <option value="" disabled>
                  {formServiceOptions.length === 0
                    ? "Chưa có dịch vụ cho cửa hàng này"
                    : "Chọn dịch vụ"}
                </option>
                {formServiceOptions.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} phút)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-staff">Nhân viên (tuỳ chọn)</Label>
              <select
                id="booking-staff"
                value={form.staff_id ?? "none"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    staff_id:
                      event.target.value === "none" ? null : event.target.value,
                  }))
                }
                className={selectClassName}
              >
                <option value="none">Không chỉ định</option>
                {formStaffOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Tên khách</Label>
              <Input
                id="customer-name"
                value={form.customer_name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customer_name: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Số điện thoại</Label>
              <Input
                id="customer-phone"
                value={form.customer_phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customer_phone: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-date">Ngày hẹn</Label>
              <Input
                id="booking-date"
                type="date"
                value={form.booking_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, booking_date: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Giờ bắt đầu</Label>
              <Input
                id="start-time"
                type="time"
                value={form.start_time}
                onChange={(event) =>
                  setForm((current) => ({ ...current, start_time: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>

            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={isPending}>
                {editingId ? "Lưu thay đổi" : "Tạo lịch hẹn"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium">Danh sách lịch hẹn</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={shopFilter}
            onChange={(event) => setShopFilter(event.target.value)}
            aria-label="Lọc cửa hàng"
            className={cn(selectClassName, "w-[180px]")}
          >
            <option value={ALL_SHOPS}>Tất cả cửa hàng</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Lọc trạng thái"
            className={cn(selectClassName, "w-[180px]")}
          >
            <option value={ALL_STATUSES}>Tất cả trạng thái</option>
            {(Object.keys(bookingStatusLabels) as BookingStatus[]).map((status) => (
              <option key={status} value={status}>
                {bookingStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {visibleBookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {initialBookings.length === 0
                ? "Chưa có lịch hẹn nào."
                : "Không có lịch hẹn phù hợp bộ lọc."}
            </CardContent>
          </Card>
        ) : (
          visibleBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    {booking.customer_name}
                    <StatusBadge status={booking.status} />
                  </CardTitle>
                  <CardDescription>
                    {booking.shops?.name ??
                      (booking.shop_id ? shopNameById.get(booking.shop_id) : undefined) ??
                      "—"}{" "}
                    · {booking.booking_date} · {formatTime(booking.start_time)} –{" "}
                    {formatTime(booking.end_time)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(booking)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDelete(booking.id)}
                    disabled={isPending}
                  >
                    Xóa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Dịch vụ:</span>{" "}
                  {booking.services?.name ?? "—"}
                  {booking.services?.duration_minutes
                    ? ` (${booking.services.duration_minutes} phút)`
                    : ""}
                </p>
                <p>
                  <span className="text-muted-foreground">Nhân viên:</span>{" "}
                  {booking.staff?.name ?? "Không chỉ định"}
                </p>
                <p>
                  <span className="text-muted-foreground">Điện thoại:</span>{" "}
                  {booking.customer_phone}
                </p>
                {booking.notes ? (
                  <p>
                    <span className="text-muted-foreground">Ghi chú:</span> {booking.notes}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2">
                  {booking.status !== "confirmed" && booking.status !== "cancelled" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleStatusChange(booking.id, "confirmed")}
                      disabled={isPending}
                    >
                      Xác nhận
                    </Button>
                  ) : null}
                  {booking.status !== "completed" && booking.status !== "cancelled" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleStatusChange(booking.id, "completed")}
                      disabled={isPending}
                    >
                      Hoàn thành
                    </Button>
                  ) : null}
                  {booking.status !== "cancelled" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleStatusChange(booking.id, "cancelled")}
                      disabled={isPending}
                    >
                      Hủy
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
