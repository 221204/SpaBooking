"use client";

import { ExternalLinkIcon, PlusIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

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

import { createShop, deleteShop, updateShop } from "../actions";
import {
  initialShopActionState,
  type Shop,
  type ShopActionState,
} from "../types";

type ShopManagerProps = {
  shops: Shop[];
};

function formatTimeInput(value: string | null) {
  return value?.slice(0, 5) ?? "";
}

function formatTimeDisplay(value: string | null) {
  return value?.slice(0, 5) ?? "--:--";
}

function getShopFormKey(shop: Shop) {
  return [
    shop.id,
    shop.name,
    shop.slug,
    shop.address,
    shop.open_time,
    shop.close_time,
  ].join(":");
}

function ActionMessage({ state }: { state: ShopActionState }) {
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

function ShopCreateForm({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [state, formAction, isPending] = useActionState(
    createShop,
    initialShopActionState,
  );

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusIcon className="size-4" aria-hidden="true" />
            Thêm cửa hàng mới
          </CardTitle>
          <CardDescription>
            Tạo thêm chi nhánh spa với slug công khai riêng.
          </CardDescription>
        </div>
        {!defaultOpen ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "Ẩn form" : "Thêm mới"}
          </Button>
        ) : null}
      </CardHeader>

      {isOpen ? (
        <CardContent>
          <form action={formAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <ActionMessage state={state} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-name">Tên cửa hàng</Label>
              <Input
                id="create-name"
                name="name"
                placeholder="Spa Sen Trắng"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug công khai</Label>
              <Input
                id="create-slug"
                name="slug"
                placeholder="spa-sen-trang"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL đặt lịch: /slug-cua-ban
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="create-address">Địa chỉ</Label>
              <Input
                id="create-address"
                name="address"
                placeholder="123 Nguyễn Trãi, Quận 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-open-time">Giờ mở cửa</Label>
              <Input
                id="create-open-time"
                name="open_time"
                type="time"
                defaultValue="08:00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-close-time">Giờ đóng cửa</Label>
              <Input
                id="create-close-time"
                name="close_time"
                type="time"
                defaultValue="20:00"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                size="lg"
                className="min-w-36"
                disabled={isPending}
              >
                {isPending ? "Đang tạo..." : "Tạo cửa hàng"}
              </Button>
            </div>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}

function ShopDeleteForm({ shop }: { shop: Shop }) {
  const [state, formAction, isPending] = useActionState(
    deleteShop,
    initialShopActionState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Xóa "${shop.name}" sẽ xóa toàn bộ dịch vụ, nhân viên và lịch hẹn liên quan. Bạn chắc chắn muốn xóa?`,
          )
        ) {
          event.preventDefault();
        }
      }}
      className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
    >
      <div>
        <p className="text-sm font-medium text-destructive">Vùng nguy hiểm</p>
        <p className="text-xs text-muted-foreground">
          Thao tác này không thể hoàn tác.
        </p>
      </div>
      <ActionMessage state={state} />
      <input type="hidden" name="shop_id" value={shop.id} />
      <Button
        type="submit"
        variant="destructive"
        size="lg"
        className="min-w-36 border border-destructive/30 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isPending}
      >
        {isPending ? "Đang xóa..." : "Xóa cửa hàng"}
      </Button>
    </form>
  );
}

function ShopEditCard({ shop, index }: { shop: Shop; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [state, formAction, isPending] = useActionState(
    updateShop,
    initialShopActionState,
  );

  return (
    <Card className={cn(isExpanded && "ring-1 ring-primary/20")}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{shop.name}</CardTitle>
              <Badge variant="secondary">/{shop.slug}</Badge>
            </div>
            <CardDescription className="space-y-1">
              {shop.address ? <span className="block">{shop.address}</span> : null}
              <span className="block text-xs">
                Giờ mở cửa: {formatTimeDisplay(shop.open_time)} –{" "}
                {formatTimeDisplay(shop.close_time)}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              render={
                <Link
                  href={`/${shop.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
              Trang đặt lịch
            </Button>
            <Button
              type="button"
              variant={isExpanded ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded ? "Thu gọn" : "Chỉnh sửa"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-6 border-t pt-6">
          <form
            key={getShopFormKey(shop)}
            action={formAction}
            className="grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="shop_id" value={shop.id} />

            <div className="space-y-2 md:col-span-2">
              <ActionMessage state={state} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${shop.id}`}>Tên cửa hàng</Label>
              <Input
                id={`name-${shop.id}`}
                name="name"
                defaultValue={shop.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`slug-${shop.id}`}>Slug công khai</Label>
              <Input
                id={`slug-${shop.id}`}
                name="slug"
                defaultValue={shop.slug}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`address-${shop.id}`}>Địa chỉ</Label>
              <Input
                id={`address-${shop.id}`}
                name="address"
                defaultValue={shop.address ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`open-time-${shop.id}`}>Giờ mở cửa</Label>
              <Input
                id={`open-time-${shop.id}`}
                name="open_time"
                type="time"
                defaultValue={formatTimeInput(shop.open_time)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`close-time-${shop.id}`}>Giờ đóng cửa</Label>
              <Input
                id={`close-time-${shop.id}`}
                name="close_time"
                type="time"
                defaultValue={formatTimeInput(shop.close_time)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-2 md:col-span-2">
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

          <ShopDeleteForm shop={shop} />
        </CardContent>
      ) : null}
    </Card>
  );
}

export function ShopManager({ shops }: ShopManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <StoreIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Tổng số cửa hàng:</span>
          <Badge variant="outline">{shops.length}</Badge>
        </div>
        {shops.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Nhấn &quot;Chỉnh sửa&quot; trên từng cửa hàng để cập nhật thông tin.
          </p>
        ) : null}
      </div>

      {shops.length === 0 ? (
        <ShopCreateForm defaultOpen />
      ) : (
        <>
          <div className="space-y-4">
            {shops.map((shop, index) => (
              <ShopEditCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>
          <ShopCreateForm defaultOpen={false} />
        </>
      )}
    </div>
  );
}
