const HCM_TIMEZONE = "Asia/Ho_Chi_Minh";

export function getTodayDateInHoChiMinh() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HCM_TIMEZONE,
  }).format(new Date());
}

export function getStartOfTodayInHoChiMinh() {
  const [year, month, day] = getTodayDateInHoChiMinh().split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidBookingDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function formatDateValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HCM_TIMEZONE,
  }).format(date);
}

export function getDayOfWeekFromDateString(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function formatDisplayTime(time: string) {
  return time.slice(0, 5);
}
