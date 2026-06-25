import type { Tables } from "@/types/database.types";

export type StaffRow = Tables<"staff">;
export type StaffScheduleRow = Tables<"staff_schedules">;
export type ShopOption = Pick<Tables<"shops">, "id" | "name" | "slug">;

export type StaffWithSchedules = StaffRow & {
  staff_schedules: StaffScheduleRow[];
};

export type StaffFormData = {
  shop_id: string;
  name: string;
  phone: string;
};

export type ScheduleFormData = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
};

export const DAY_OF_WEEK_OPTIONS = Object.entries(DAY_OF_WEEK_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  }),
);

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
