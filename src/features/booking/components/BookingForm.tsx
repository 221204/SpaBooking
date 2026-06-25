"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { BookingPageHeader } from "@/features/booking/components/BookingPageHeader";
import { BookingStepHeader } from "@/features/booking/components/BookingStepHeader";
import { BookingSummaryPanel } from "@/features/booking/components/BookingSummaryPanel";
import { ServiceCard } from "@/features/booking/components/ServiceCard";
import { SlotPicker } from "@/features/booking/components/SlotPicker";
import {
  formatDateValue,
  formatDisplayTime,
  getDayOfWeekFromDateString,
  getStartOfTodayInHoChiMinh,
} from "@/features/booking/lib/dates";
import { useAvailableSlots } from "@/features/booking/hooks/useAvailableSlots";
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking";
import type { PublicService, PublicShop, PublicStaff, TimeSlot } from "@/features/booking/types";
import { publicUi } from "@/features/marketing/lib/public-ui";

type BookingFormProps = {
  shop: PublicShop;
  services: PublicService[];
  staff: PublicStaff[];
  hasStaffSchedules: boolean;
};

const motionProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.08 },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as const },
};

function hasStaffWorkingOnDate(staffMembers: PublicStaff[], date: string) {
  const dayOfWeek = getDayOfWeekFromDateString(date);

  return staffMembers.some((member) =>
    (member.staff_schedules ?? []).some(
      (schedule) => schedule.day_of_week === dayOfWeek,
    ),
  );
}

export function BookingForm({
  shop,
  services,
  staff,
  hasStaffSchedules,
}: BookingFormProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    services[0]?.id ?? null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const bookingDate = selectedDate ? formatDateValue(selectedDate) : null;
  const hasStaffStep = staff.length > 0;
  const timeStep = hasStaffStep ? 3 : 2;
  const contactStep = hasStaffStep ? 4 : 3;

  const { slots, isLoading, error } = useAvailableSlots({
    shopSlug: shop.slug,
    serviceId: selectedServiceId,
    date: bookingDate,
    staffId: selectedStaffId,
  });

  const { createBooking, isSubmitting, error: submitError } = useCreateBooking();

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const selectedStaff = useMemo(
    () => staff.find((member) => member.id === selectedStaffId) ?? null,
    [staff, selectedStaffId],
  );

  const slotAvailabilityMessage = useMemo(() => {
    if (!bookingDate || !selectedServiceId) {
      return null;
    }

    if (staff.length > 0 && hasStaffSchedules && !hasStaffWorkingOnDate(staff, bookingDate)) {
      return "Không có nhân viên làm việc vào ngày này. Vui lòng chọn ngày khác.";
    }

    if (selectedStaffId && staff.length > 0 && hasStaffSchedules) {
      const dayOfWeek = getDayOfWeekFromDateString(bookingDate);
      const member = staff.find((item) => item.id === selectedStaffId);
      const worksOnDay = member?.staff_schedules?.some(
        (schedule) => schedule.day_of_week === dayOfWeek,
      );

      if (!worksOnDay) {
        return "Nhân viên đã chọn không làm việc vào ngày này.";
      }
    }

    return null;
  }, [bookingDate, selectedServiceId, staff, hasStaffSchedules, selectedStaffId]);

  const canSubmit = Boolean(
    selectedServiceId &&
      bookingDate &&
      selectedSlot &&
      customerName.trim() &&
      customerPhone.trim() &&
      !slotAvailabilityMessage,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedServiceId || !bookingDate || !selectedSlot) {
      toast.error("Vui lòng chọn dịch vụ, ngày và khung giờ.");
      return;
    }

    const result = await createBooking({
      shop_id: shop.id,
      service_id: selectedServiceId,
      staff_id: selectedSlot.staff_id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      booking_date: bookingDate,
      start_time: selectedSlot.start_time,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setIsSuccess(true);
    toast.success("Đặt lịch thành công!");
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg">
        <div className={publicUi.bezelOuter}>
          <div
            className={cn(
              publicUi.bezelInner,
              "bg-[#fbfcfb] p-8 text-center sm:p-12",
            )}
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#022c22]/10 text-[#022c22]">
              <CheckIcon className="size-8 stroke-[1.5]" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-[#111110]">
              Hoàn tất
            </h2>
            <p className="mt-4 leading-relaxed text-[#525252]">
              Cảm ơn bạn! Lịch hẹn đã được ghi nhận và đang chờ xác nhận từ spa.
            </p>
            <div className="mt-10">
              <a
                href="/shops"
                className={cn(
                  "group relative inline-flex h-14 items-center justify-between rounded-full bg-[#022c22] pl-8 pr-2 text-base font-medium text-white",
                  publicUi.transition,
                  "hover:bg-[#011a14] active:scale-[0.98]",
                )}
              >
                <span>Về danh sách cửa hàng</span>
                <div className="ml-6 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
                  <ArrowRightIcon className="size-4 stroke-[1.5]" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BookingPageHeader shop={shop} />

      <BookingSummaryPanel
        variant="compact"
        shop={shop}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        selectedStaff={selectedStaff}
        submitError={submitError}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        showSubmit={false}
      />

      <form
        id="public-booking-form"
        className="grid grid-cols-1 items-start gap-12 pb-28 lg:grid-cols-12 lg:gap-16 lg:pb-24"
        onSubmit={handleSubmit}
      >
        <div className={cn(publicUi.sectionGap, "lg:col-span-7 xl:col-span-8")}>
          {staff.length > 0 && !hasStaffSchedules ? (
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed text-amber-900">
              Cửa hàng chưa thiết lập ca làm việc cho nhân viên. Khung giờ hiển thị
              theo giờ mở cửa chung.
            </p>
          ) : null}

          <motion.section {...motionProps}>
            <BookingStepHeader
              step={1}
              title="Dịch vụ"
              description="Các dịch vụ đang có sẵn tại không gian này."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedServiceId === service.id}
                  onSelect={(serviceId) => {
                    setSelectedServiceId(serviceId);
                    setSelectedSlot(null);
                  }}
                />
              ))}
            </div>
          </motion.section>

          {hasStaffStep ? (
            <motion.section {...motionProps}>
              <BookingStepHeader
                step={2}
                title="Chuyên viên (tuỳ chọn)"
                description={
                  !hasStaffSchedules
                    ? "Chưa có dữ liệu ca làm việc — bạn có thể bỏ qua."
                    : "Chọn chuyên viên bạn muốn phục vụ, hoặc để spa sắp xếp."
                }
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(null);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "rounded-full px-6 py-3 text-sm font-medium tracking-wide outline-none active:scale-[0.98]",
                    publicUi.transition,
                    selectedStaffId === null
                      ? "bg-[#022c22] text-white shadow-lg shadow-[#022c22]/30 ring-2 ring-[#022c22]/50 ring-offset-2"
                      : "bg-white text-[#111110] ring-1 ring-[#111110]/10 hover:bg-[#fbfcfb] hover:ring-[#111110]/30 hover:shadow-sm",
                  )}
                >
                  Bất kỳ ai
                </button>
                {staff.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(member.id);
                      setSelectedSlot(null);
                    }}
                    className={cn(
                      "rounded-full px-6 py-3 text-sm font-medium tracking-wide outline-none active:scale-[0.98]",
                      publicUi.transition,
                      selectedStaffId === member.id
                        ? "bg-[#022c22] text-white shadow-lg shadow-[#022c22]/30 ring-2 ring-[#022c22]/50 ring-offset-2"
                        : "bg-white text-[#111110] ring-1 ring-[#111110]/10 hover:bg-[#fbfcfb] hover:ring-[#111110]/30 hover:shadow-sm",
                    )}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </motion.section>
          ) : null}

          <motion.section {...motionProps}>
            <BookingStepHeader
              step={timeStep}
              title="Thời gian"
              description={`Giờ mở cửa: ${formatDisplayTime(shop.open_time ?? "08:00")} – ${formatDisplayTime(shop.close_time ?? "20:00")}`}
            />

            <div className="grid items-start gap-8 lg:grid-cols-[auto_1fr] lg:gap-10">
              <div className={cn(publicUi.bezelOuter, "w-fit max-w-full")}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => date < getStartOfTodayInHoChiMinh()}
                  className={cn(
                    publicUi.bezelInner,
                    "w-full min-w-[280px] bg-[#fbfcfb] p-4 text-[#111110]",
                  )}
                />
              </div>

              <div className="min-w-0">
                <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#111110]">
                  Khung giờ trống
                </p>
                {!bookingDate || !selectedServiceId ? (
                  <p className="leading-relaxed text-[#525252]">
                    Vui lòng chọn ngày trên lịch trước.
                  </p>
                ) : slotAvailabilityMessage ? (
                  <p className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 leading-relaxed text-[#525252]">
                    {slotAvailabilityMessage}
                  </p>
                ) : (
                  <SlotPicker
                    slots={slots}
                    selectedStartTime={selectedSlot?.start_time ?? null}
                    selectedStaffId={selectedSlot?.staff_id ?? null}
                    isLoading={isLoading}
                    error={error}
                    onSelect={setSelectedSlot}
                  />
                )}
              </div>
            </div>
          </motion.section>

          <motion.section {...motionProps}>
            <BookingStepHeader
              step={contactStep}
              title="Thông tin liên hệ"
              description="Thông tin để spa xác nhận lịch hẹn của bạn."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label
                  htmlFor="customer-name"
                  className="text-[13px] font-semibold uppercase tracking-wider text-[#111110]/50"
                >
                  Họ tên
                </label>
                <input
                  id="customer-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border-none bg-white px-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ring-1 ring-[#111110]/10 outline-none transition-all duration-500 focus:ring-2 focus:ring-[#022c22]"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="customer-phone"
                  className="text-[13px] font-semibold uppercase tracking-wider text-[#111110]/50"
                >
                  Số điện thoại
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border-none bg-white px-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ring-1 ring-[#111110]/10 outline-none transition-all duration-500 focus:ring-2 focus:ring-[#022c22]"
                  placeholder="0901234567"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label
                  htmlFor="customer-notes"
                  className="text-[13px] font-semibold uppercase tracking-wider text-[#111110]/50"
                >
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  id="customer-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border-none bg-white p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ring-1 ring-[#111110]/10 outline-none transition-all duration-500 focus:ring-2 focus:ring-[#022c22]"
                  placeholder="Bạn có yêu cầu đặc biệt nào không?"
                />
              </div>
            </div>
          </motion.section>
        </div>

        <div className="hidden lg:col-span-5 lg:block xl:col-span-4">
          <BookingSummaryPanel
            variant="sidebar"
            shop={shop}
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            selectedStaff={selectedStaff}
            submitError={submitError}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
          />
        </div>
      </form>

      <BookingSummaryPanel
        variant="mobile-bar"
        shop={shop}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        selectedStaff={selectedStaff}
        submitError={submitError}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
      />
    </>
  );
}
