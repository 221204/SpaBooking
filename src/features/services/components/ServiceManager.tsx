"use client";

import { ScissorsIcon } from "lucide-react";
import { useMemo, useState, useActionState, type ChangeEvent } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  createService,
  deleteService,
  toggleServiceStatus,
  updateService,
} from "../actions";
import {
  initialServiceActionState,
  type Service,
  type ServiceActionState,
  type ShopOption,
} from "../types";

type ServiceManagerProps = {
  services: Service[];
  shops: ShopOption[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPriceInput(value: number) {
  if (value <= 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
}

function PriceInput({
  id,
  defaultValue = 0,
  required,
  placeholder = "300.000",
}: {
  id: string;
  defaultValue?: number;
  required?: boolean;
  placeholder?: string;
}) {
  const [rawValue, setRawValue] = useState(
    defaultValue > 0 ? String(defaultValue) : "",
  );
  const [displayValue, setDisplayValue] = useState(
    formatPriceInput(defaultValue),
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "");
    const numeric = digits ? Number(digits) : 0;

    setRawValue(digits);
    setDisplayValue(digits ? numeric.toLocaleString("vi-VN") : "");
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="pr-14"
        aria-describedby={`${id}-unit`}
      />
      <input type="hidden" name="price" value={rawValue} />
      <span
        id={`${id}-unit`}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm font-medium text-muted-foreground"
      >
        VND
      </span>
    </div>
  );
}

function getShopName(shops: ShopOption[], shopId: string | null) {
  return shops.find((shop) => shop.id === shopId)?.name ?? "Chưa rõ cửa hàng";
}

function getServiceFormKey(service: Service) {
  return [
    service.id,
    service.name,
    service.price,
    service.duration_minutes,
    service.is_active,
    service.description,
    service.shop_id,
  ].join(":");
}

function ActionMessage({ state }: { state: ServiceActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      }
    >
      {state.message}
    </p>
  );
}

function ShopSelect({
  defaultValue,
  disabled,
  shops,
  id,
}: {
  defaultValue?: string | null;
  disabled?: boolean;
  shops: ShopOption[];
  id?: string;
}) {
  return (
    <select
      id={id}
      name="shop_id"
      defaultValue={defaultValue ?? shops[0]?.id ?? ""}
      disabled={disabled}
      required
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
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

function ServiceCreateForm({
  shops,
  defaultShopId,
}: {
  shops: ShopOption[];
  defaultShopId?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createService,
    initialServiceActionState,
  );

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Thêm dịch vụ mới</CardTitle>
        <CardDescription>
          Giá lưu dạng số nguyên (VND). Thời lượng dùng để tính khung giờ đặt
          lịch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <ActionMessage state={state} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-shop">Cửa hàng</Label>
            <ShopSelect
              id="create-shop"
              shops={shops}
              defaultValue={defaultShopId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-service-name">Tên dịch vụ</Label>
            <Input
              id="create-service-name"
              name="name"
              placeholder="Massage thư giãn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-service-price">Giá dịch vụ</Label>
            <PriceInput id="create-service-price" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-service-duration">Thời lượng</Label>
            <div className="relative">
              <Input
                id="create-service-duration"
                name="duration_minutes"
                type="number"
                min={1}
                defaultValue={60}
                required
                className="pr-14"
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                phút
              </span>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="create-service-description">Mô tả</Label>
            <textarea
              id="create-service-description"
              name="description"
              placeholder="Mô tả ngắn về dịch vụ..."
              className={cn(
                "min-h-24 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-input"
            />
            Hiển thị trên trang đặt lịch công khai
          </label>

          <div className="md:col-span-2">
            <Button
              type="submit"
              size="lg"
              className="min-w-36 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? "Đang tạo..." : "Tạo dịch vụ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ToggleServiceForm({ service }: { service: Service }) {
  const [state, formAction, isPending] = useActionState(
    toggleServiceStatus,
    initialServiceActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="service_id" value={service.id} />
      <input
        type="hidden"
        name="is_active"
        value={service.is_active ? "false" : "true"}
      />
      <ActionMessage state={state} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending
          ? "Đang cập nhật..."
          : service.is_active
            ? "Ẩn dịch vụ"
            : "Kích hoạt lại"}
      </Button>
    </form>
  );
}

function ServiceDeleteForm({ service }: { service: Service }) {
  const [state, formAction, isPending] = useActionState(
    deleteService,
    initialServiceActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-2"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Xóa "${service.name}"? Nếu đã có lịch hẹn, nên ẩn dịch vụ thay vì xóa.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="service_id" value={service.id} />
      <ActionMessage state={state} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        className="border border-destructive/30"
        disabled={isPending}
      >
        {isPending ? "Đang xóa..." : "Xóa"}
      </Button>
    </form>
  );
}

function ServiceEditCard({
  service,
  shops,
}: {
  service: Service;
  shops: ShopOption[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateService,
    initialServiceActionState,
  );

  return (
    <Card className={cn(isExpanded && "ring-1 ring-primary/20")}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant={service.is_active ? "default" : "secondary"}>
                {service.is_active ? "Đang hoạt động" : "Đã ẩn"}
              </Badge>
            </div>
            <CardDescription>
              {getShopName(shops, service.shop_id)} ·{" "}
              {formatCurrency(service.price)} · {service.duration_minutes} phút
            </CardDescription>
            {service.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            {isExpanded ? "Thu gọn" : "Chỉnh sửa"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-4 border-t pt-6">
          <form
            key={getServiceFormKey(service)}
            action={formAction}
            className="grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="service_id" value={service.id} />

            <div className="space-y-2 md:col-span-2">
              <ActionMessage state={state} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`shop-${service.id}`}>Cửa hàng</Label>
              <ShopSelect
                id={`shop-${service.id}`}
                shops={shops}
                defaultValue={service.shop_id}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`service-name-${service.id}`}>Tên dịch vụ</Label>
              <Input
                id={`service-name-${service.id}`}
                name="name"
                defaultValue={service.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`service-price-${service.id}`}>Giá dịch vụ</Label>
              <PriceInput
                id={`service-price-${service.id}`}
                defaultValue={service.price}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`service-duration-${service.id}`}>
                Thời lượng
              </Label>
              <div className="relative">
                <Input
                  id={`service-duration-${service.id}`}
                  name="duration_minutes"
                  type="number"
                  min={1}
                  defaultValue={service.duration_minutes}
                  required
                  className="pr-14"
                />
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  phút
                </span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`service-description-${service.id}`}>Mô tả</Label>
              <textarea
                id={`service-description-${service.id}`}
                name="description"
                defaultValue={service.description ?? ""}
                className={cn(
                  "min-h-24 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={service.is_active ?? true}
                className="size-4 rounded border-input"
              />
              Hiển thị trên trang đặt lịch công khai
            </label>

            <div className="md:col-span-2">
              <Button
                type="submit"
                size="lg"
                className="min-w-36 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-start gap-4 rounded-lg border bg-muted/20 p-4">
            <ToggleServiceForm service={service} />
            <ServiceDeleteForm service={service} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function ServiceManager({ services, shops }: ServiceManagerProps) {
  const [filterShopId, setFilterShopId] = useState<string>("all");

  const filteredServices = useMemo(() => {
    if (filterShopId === "all") {
      return services;
    }

    return services.filter((service) => service.shop_id === filterShopId);
  }, [filterShopId, services]);

  const activeCount = services.filter((service) => service.is_active).length;

  if (shops.length === 0) {
    return <NoShopPrompt feature="dịch vụ" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <ScissorsIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            Tổng dịch vụ: <Badge variant="outline">{services.length}</Badge>
          </span>
          <span className="text-muted-foreground">
            Đang hoạt động: {activeCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filter-shop" className="sr-only">
            Lọc theo cửa hàng
          </Label>
          <select
            id="filter-shop"
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

      <ServiceCreateForm
        shops={shops}
        defaultShopId={filterShopId === "all" ? shops[0]?.id : filterShopId}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Danh sách dịch vụ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredServices.length} dịch vụ
            {filterShopId !== "all"
              ? ` thuộc ${getShopName(shops, filterShopId)}`
              : " trên tất cả cửa hàng"}
          </p>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <ServiceEditCard
                key={service.id}
                service={service}
                shops={shops}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                Chưa có dịch vụ cho bộ lọc này. Hãy thêm dịch vụ mới ở form phía
                trên.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
