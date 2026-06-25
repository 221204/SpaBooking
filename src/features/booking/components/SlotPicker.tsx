"use client";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDisplayTime } from "@/features/booking/lib/dates";
import type { TimeSlot } from "@/features/booking/types";
import { publicUi } from "@/features/marketing/lib/public-ui";
import { cn } from "@/lib/utils";

type SlotPickerProps = {
  slots: TimeSlot[];
  selectedStartTime?: string | null;
  selectedStaffId?: string | null;
  onSelect: (slot: TimeSlot) => void;
  isLoading?: boolean;
  error?: string | null;
};

export function SlotPicker({
  slots,
  selectedStartTime,
  selectedStaffId,
  onSelect,
  isLoading = false,
  error,
}: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner label="Đang tải khung giờ..." />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-50/50 p-4 text-sm leading-relaxed text-red-600">
        {error}
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-2xl border border-[#111110]/10 bg-white p-4 text-sm leading-relaxed text-[#525252]">
        Rất tiếc, không còn khung giờ trống nào cho ngày này. Vui lòng chọn một
        ngày khác.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot) => {
        const isSelected =
          selectedStartTime === slot.start_time &&
          selectedStaffId === slot.staff_id;

        return (
          <button
            key={`${slot.start_time}-${slot.staff_id}`}
            type="button"
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center rounded-full px-3 py-2.5 text-sm font-medium tracking-wide outline-none active:scale-[0.98]",
              publicUi.transition,
              isSelected
                ? "bg-[#022c22] text-white shadow-lg shadow-[#022c22]/30 ring-2 ring-[#022c22]/50 ring-offset-2"
                : "bg-white text-[#111110] ring-1 ring-[#111110]/10 hover:bg-[#fbfcfb] hover:ring-[#111110]/30 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#022c22]/40",
            )}
          >
            <span>{formatDisplayTime(slot.start_time)}</span>
            {slot.staff_name ? (
              <span className="mt-0.5 max-w-full truncate text-[11px] font-normal opacity-80">
                {slot.staff_name}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
