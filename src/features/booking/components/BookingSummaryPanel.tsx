"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Clock3Icon, MapPinIcon, ArrowRightIcon } from "lucide-react";

import { formatDisplayTime } from "@/features/booking/lib/dates";
import type { PublicService, PublicShop, PublicStaff, TimeSlot } from "@/features/booking/types";
import { publicUi } from "@/features/marketing/lib/public-ui";
import { cn } from "@/lib/utils";

type BookingSummaryPanelProps = {
  shop: PublicShop;
  selectedService: PublicService | null;
  selectedDate: Date | undefined;
  selectedSlot: TimeSlot | null;
  selectedStaff: PublicStaff | null;
  submitError: string | null;
  isSubmitting: boolean;
  canSubmit: boolean;
  variant?: "sidebar" | "compact" | "mobile-bar";
  showSubmit?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BookingSummaryPanel({
  shop,
  selectedService,
  selectedDate,
  selectedSlot,
  selectedStaff,
  submitError,
  isSubmitting,
  canSubmit,
  variant = "sidebar",
  showSubmit = true,
}: BookingSummaryPanelProps) {
  const price = selectedService?.price ?? 0;

  if (variant === "mobile-bar") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#111110]/10 bg-white/95 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#111110]">
              {selectedService?.name ?? "Chọn dịch vụ"}
            </p>
            <p className="text-lg font-medium tracking-tight text-[#022c22]">
              {formatCurrency(price)}
            </p>
          </div>
          <button
            type="submit"
            form="public-booking-form"
            disabled={!canSubmit || isSubmitting}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#022c22] px-6 text-sm font-medium text-white",
              publicUi.transition,
              "hover:bg-[#011a14] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            <ArrowRightIcon className="size-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div className="space-y-2">
        <h3 className="text-xl font-medium tracking-tight text-[#111110]">
          {variant === "compact" ? "Lịch hẹn của bạn" : "Tóm tắt đặt lịch"}
        </h3>
        <p className="text-[#525252]">{shop.name}</p>
      </div>

      <div className="space-y-4 border-t border-[#111110]/5 pt-6">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#111110]/5">
            <MapPinIcon className="size-3 text-[#111110]/60 stroke-[1.5]" />
          </div>
          <span className="text-sm leading-relaxed text-[#525252]">
            {shop.address || "Chưa cập nhật địa chỉ"}
          </span>
        </div>

        {selectedDate ? (
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#111110]/5">
              <CalendarIcon className="size-3 text-[#111110]/60 stroke-[1.5]" />
            </div>
            <span className="text-sm text-[#525252]">
              {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
        ) : null}

        {selectedSlot ? (
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#111110]/5">
              <Clock3Icon className="size-3 text-[#111110]/60 stroke-[1.5]" />
            </div>
            <span className="text-sm text-[#525252]">
              {formatDisplayTime(selectedSlot.start_time)}
              {selectedService
                ? ` · ${selectedService.duration_minutes} phút`
                : ""}
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl bg-[#fbfcfb] p-5 ring-1 ring-[#111110]/5">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[15px] font-medium leading-snug text-[#111110]">
            {selectedService?.name || "Chưa chọn dịch vụ"}
          </span>
          <span className="shrink-0 text-[15px] font-medium text-[#111110]">
            {formatCurrency(price)}
          </span>
        </div>

        {selectedStaff ? (
          <p className="text-sm text-[#525252]">
            Chuyên viên:{" "}
            <span className="font-medium text-[#111110]">{selectedStaff.name}</span>
          </p>
        ) : null}
      </div>

      <div className="flex items-end justify-between pt-2">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#111110]/50">
          Tổng cộng
        </span>
        <span className="text-3xl font-medium tracking-tight text-[#022c22]">
          {formatCurrency(price)}
        </span>
      </div>

      {submitError ? (
        <p className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      {showSubmit && variant === "sidebar" ? (
        <button
          type="submit"
          form="public-booking-form"
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "group relative flex h-16 w-full items-center justify-between rounded-full bg-[#022c22] pl-8 pr-2 text-base font-medium text-white shadow-[0_8px_20px_-8px_rgba(2,44,34,0.5)]",
            publicUi.transition,
            "hover:bg-[#011a14] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}</span>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
            <ArrowRightIcon className="size-5 stroke-[1.5]" />
          </div>
        </button>
      ) : null}
    </>
  );

  if (variant === "compact") {
    return (
      <div className={cn(publicUi.bezelOuter, "mb-10 lg:hidden")}>
        <div className={cn(publicUi.bezelInner, "space-y-6 p-6 sm:p-8")}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(publicUi.bezelOuter, "sticky top-32")}>
      <div className={cn(publicUi.bezelInner, "space-y-8 p-6 sm:p-8")}>
        {content}
      </div>
    </div>
  );
}
