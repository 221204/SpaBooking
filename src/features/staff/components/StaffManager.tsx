"use client";

import { UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  addStaffSchedule,
  createStaff,
  deleteStaff,
  deleteStaffSchedule,
  toggleStaffActive,
  updateStaff,
} from "@/features/staff/actions";
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_OPTIONS,
  type ShopOption,
  type StaffWithSchedules,
} from "@/features/staff/types";

type StaffManagerProps = {
  shops: ShopOption[];
  initialStaff: StaffWithSchedules[];
};

const emptyScheduleForm = {
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
};

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getShopName(shops: ShopOption[], shopId: string | null) {
  return shops.find((shop) => shop.id === shopId)?.name ?? "Chưa rõ cửa hàng";
}

function ShopSelect({
  shops,
  value,
  onChange,
  id,
}: {
  shops: ShopOption[];
  value: string;
  onChange: (shopId: string) => void;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
    >
      {shops.map((shop) => (
        <option key={shop.id} value={shop.id}>
          {shop.name}
        </option>
      ))}
    </select>
  );
}

function StaffCard({
  member,
  shops,
  isPending,
  onRefresh,
}: {
  member: StaffWithSchedules;
  shops: ShopOption[];
  isPending: boolean;
  onRefresh: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    shop_id: member.shop_id ?? shops[0]?.id ?? "",
    name: member.name,
    phone: member.phone ?? "",
  });
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);

  async function handleUpdate() {
    const result = await updateStaff(member.id, editForm);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã cập nhật nhân viên.");
    setIsEditing(false);
    onRefresh();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Xóa nhân viên "${member.name}"? Lịch làm việc liên quan cũng sẽ bị xóa.`,
      )
    ) {
      return;
    }

    const result = await deleteStaff(member.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã xóa nhân viên.");
    onRefresh();
  }

  async function handleToggleActive() {
    const result = await toggleStaffActive(member.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã cập nhật trạng thái nhân viên.");
    onRefresh();
  }

  async function handleAddSchedule() {
    const result = await addStaffSchedule(member.id, scheduleForm);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã thêm lịch làm việc.");
    setScheduleForm(emptyScheduleForm);
    onRefresh();
  }

  async function handleDeleteSchedule(scheduleId: string) {
    const result = await deleteStaffSchedule(scheduleId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã xóa lịch làm việc.");
    onRefresh();
  }

  return (
    <Card className={cn(isExpanded && "ring-1 ring-primary/20")}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <Badge variant={member.is_active ? "default" : "secondary"}>
                {member.is_active ? "Đang hoạt động" : "Tạm nghỉ"}
              </Badge>
            </div>
            <CardDescription>
              {getShopName(shops, member.shop_id)}
              {member.phone ? ` · ${member.phone}` : " · Chưa có SĐT"}
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {member.staff_schedules.length} ca làm việc / tuần
            </p>
          </div>

          <Button
            type="button"
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            {isExpanded ? "Thu gọn" : "Quản lý"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-6 border-t pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Thông tin nhân viên</p>
              {!isEditing ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditForm({
                      shop_id: member.shop_id ?? shops[0]?.id ?? "",
                      name: member.name,
                      phone: member.phone ?? "",
                    });
                    setIsEditing(true);
                  }}
                >
                  Sửa thông tin
                </Button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`shop-${member.id}`}>Cửa hàng</Label>
                  <ShopSelect
                    id={`shop-${member.id}`}
                    shops={shops}
                    value={editForm.shop_id}
                    onChange={(shopId) =>
                      setEditForm((current) => ({ ...current, shop_id: shopId }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`name-${member.id}`}>Họ tên</Label>
                  <Input
                    id={`name-${member.id}`}
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${member.id}`}>Số điện thoại</Label>
                  <Input
                    id={`phone-${member.id}`}
                    value={editForm.phone}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleUpdate()}
                    disabled={isPending}
                  >
                    Lưu
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Lịch làm việc (0 = CN, 6 = T7)</p>
            {member.staff_schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có lịch làm việc. Thêm ca bên dưới để tính khung giờ trống
                khi khách chọn nhân viên.
              </p>
            ) : (
              <ul className="space-y-2">
                {member.staff_schedules.map((schedule) => (
                  <li
                    key={schedule.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <span>
                      <strong>
                        {DAY_OF_WEEK_LABELS[schedule.day_of_week ?? 0]}
                      </strong>
                      {": "}
                      {formatTime(schedule.start_time)} –{" "}
                      {formatTime(schedule.end_time)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleDeleteSchedule(schedule.id)}
                      disabled={isPending}
                    >
                      Xóa
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-3 rounded-lg border border-dashed p-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Ngày trong tuần</Label>
                <Select
                  value={String(scheduleForm.day_of_week)}
                  onValueChange={(value) =>
                    setScheduleForm((current) => ({
                      ...current,
                      day_of_week: Number(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_WEEK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bắt đầu</Label>
                <Input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      start_time: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kết thúc</Label>
                <Input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      end_time: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void handleAddSchedule()}
                  disabled={isPending}
                >
                  Thêm ca
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleToggleActive()}
              disabled={isPending}
            >
              {member.is_active ? "Cho tạm nghỉ" : "Kích hoạt lại"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="border border-destructive/30"
              onClick={() => void handleDelete()}
              disabled={isPending}
            >
              Xóa nhân viên
            </Button>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function StaffManager({ shops, initialStaff }: StaffManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filterShopId, setFilterShopId] = useState<string>("all");
  const [createForm, setCreateForm] = useState({
    shop_id: shops[0]?.id ?? "",
    name: "",
    phone: "",
  });

  const filteredStaff = useMemo(() => {
    if (filterShopId === "all") {
      return initialStaff;
    }

    return initialStaff.filter((member) => member.shop_id === filterShopId);
  }, [filterShopId, initialStaff]);

  const activeCount = initialStaff.filter((member) => member.is_active).length;

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreateStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await createStaff(createForm);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã thêm nhân viên.");
    setCreateForm({
      shop_id: filterShopId === "all" ? shops[0]?.id ?? "" : filterShopId,
      name: "",
      phone: "",
    });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            Tổng nhân viên: <Badge variant="outline">{initialStaff.length}</Badge>
          </span>
          <span className="text-muted-foreground">Đang hoạt động: {activeCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filter-staff-shop" className="sr-only">
            Lọc theo cửa hàng
          </Label>
          <select
            id="filter-staff-shop"
            value={filterShopId}
            onChange={(event) => setFilterShopId(event.target.value)}
            className={cn(
              "h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            <option value="all">Tất cả cửa hàng</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Thêm nhân viên</CardTitle>
          <CardDescription>
            Gán nhân viên vào đúng cửa hàng trước khi thêm lịch làm việc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateStaff}>
            <div className="space-y-2">
              <Label htmlFor="create-staff-shop">Cửa hàng</Label>
              <ShopSelect
                id="create-staff-shop"
                shops={shops}
                value={createForm.shop_id}
                onChange={(shopId) =>
                  setCreateForm((current) => ({ ...current, shop_id: shopId }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-name">Họ tên</Label>
              <Input
                id="staff-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Số điện thoại</Label>
              <Input
                id="staff-phone"
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                size="lg"
                className="min-w-36 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Đang thêm..." : "Thêm nhân viên"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Danh sách nhân viên</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredStaff.length} nhân viên
            {filterShopId !== "all"
              ? ` thuộc ${getShopName(shops, filterShopId)}`
              : " trên tất cả cửa hàng"}
          </p>
        </div>

        {filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Chưa có nhân viên cho bộ lọc này.
            </CardContent>
          </Card>
        ) : (
          filteredStaff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              shops={shops}
              isPending={isPending}
              onRefresh={refresh}
            />
          ))
        )}
      </div>
    </div>
  );
}
