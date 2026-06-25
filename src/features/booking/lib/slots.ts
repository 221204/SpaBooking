import type { TimeSlot } from "@/features/booking/types";

type ScheduleEntry = {
  staff_id: string;
  staff_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type ExistingBooking = {
  staff_id: string | null;
  start_time: string;
  end_time: string;
};

export type SlotCalculationInput = {
  date: string;
  serviceDurationMinutes: number;
  shopOpenTime: string;
  shopCloseTime: string;
  schedules: ScheduleEntry[];
  existingBookings: ExistingBooking[];
  staffId?: string | null;
  slotIntervalMinutes?: number;
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDayOfWeek(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function timesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
}

export function calculateAvailableSlots(input: SlotCalculationInput): TimeSlot[] {
  const {
    date,
    serviceDurationMinutes,
    shopOpenTime,
    shopCloseTime,
    schedules,
    existingBookings,
    staffId,
    slotIntervalMinutes = 30,
  } = input;

  const dayOfWeek = getDayOfWeek(date);
  const shopOpen = parseTimeToMinutes(shopOpenTime);
  const shopClose = parseTimeToMinutes(shopCloseTime);

  const daySchedules = schedules.filter((schedule) => {
    if (schedule.day_of_week !== dayOfWeek) return false;
    if (staffId && schedule.staff_id !== staffId) return false;
    return true;
  });

  if (daySchedules.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const seen = new Set<string>();

  for (const schedule of daySchedules) {
    const scheduleStart = Math.max(
      parseTimeToMinutes(schedule.start_time),
      shopOpen,
    );
    const scheduleEnd = Math.min(
      parseTimeToMinutes(schedule.end_time),
      shopClose,
    );

    for (
      let slotStart = scheduleStart;
      slotStart + serviceDurationMinutes <= scheduleEnd;
      slotStart += slotIntervalMinutes
    ) {
      const slotEnd = slotStart + serviceDurationMinutes;
      const startTime = formatMinutesToTime(slotStart);
      const endTime = formatMinutesToTime(slotEnd);
      const key = `${schedule.staff_id}-${startTime}`;

      if (seen.has(key)) continue;

      const hasConflict = existingBookings.some((booking) => {
        if (booking.staff_id && booking.staff_id !== schedule.staff_id) {
          return false;
        }

        const bookingStart = parseTimeToMinutes(booking.start_time);
        const bookingEnd = parseTimeToMinutes(booking.end_time);

        return timesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
      });

      if (hasConflict) continue;

      seen.add(key);
      slots.push({
        start_time: startTime,
        end_time: endTime,
        staff_id: schedule.staff_id,
        staff_name: schedule.staff_name,
      });
    }
  }

  return slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function calculateShopWideSlots(input: {
  serviceDurationMinutes: number;
  shopOpenTime: string;
  shopCloseTime: string;
  existingBookings: ExistingBooking[];
  slotIntervalMinutes?: number;
}): TimeSlot[] {
  const {
    serviceDurationMinutes,
    shopOpenTime,
    shopCloseTime,
    existingBookings,
    slotIntervalMinutes = 30,
  } = input;

  const shopOpen = parseTimeToMinutes(shopOpenTime);
  const shopClose = parseTimeToMinutes(shopCloseTime);
  const slots: TimeSlot[] = [];

  for (
    let slotStart = shopOpen;
    slotStart + serviceDurationMinutes <= shopClose;
    slotStart += slotIntervalMinutes
  ) {
    const slotEnd = slotStart + serviceDurationMinutes;
    const startTime = formatMinutesToTime(slotStart);
    const endTime = formatMinutesToTime(slotEnd);

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = parseTimeToMinutes(booking.start_time);
      const bookingEnd = parseTimeToMinutes(booking.end_time);
      return timesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    if (hasConflict) continue;

    slots.push({
      start_time: startTime,
      end_time: endTime,
      staff_id: null,
      staff_name: null,
    });
  }

  return slots;
}

export function calculateEndTime(
  startTime: string,
  durationMinutes: number,
): string {
  const startMinutes = parseTimeToMinutes(startTime);
  return formatMinutesToTime(startMinutes + durationMinutes);
}
