import type { BookingStatus, Tables } from "@/types/database.types";

export type BookingRow = Tables<"bookings">;
export type ServiceRow = Tables<"services">;
export type StaffRow = Tables<"staff">;
export type ShopRow = Tables<"shops">;
export type StaffScheduleRow = Tables<"staff_schedules">;

export type PublicShop = Pick<
  ShopRow,
  "id" | "name" | "slug" | "address" | "open_time" | "close_time"
>;

export type PublicService = Pick<
  ServiceRow,
  "id" | "name" | "description" | "price" | "duration_minutes"
>;

export type PublicStaff = Pick<StaffRow, "id" | "name"> & {
  staff_schedules: Pick<
    StaffScheduleRow,
    "day_of_week" | "start_time" | "end_time"
  >[];
};

export type BookingWithRelations = BookingRow & {
  services: Pick<ServiceRow, "id" | "name" | "duration_minutes" | "price"> | null;
  staff: Pick<StaffRow, "id" | "name"> | null;
  shops: Pick<ShopRow, "id" | "name"> | null;
};

export type ShopOption = Pick<ShopRow, "id" | "name" | "slug">;

export type BookingServiceOption = Pick<
  ServiceRow,
  "id" | "shop_id" | "name" | "duration_minutes" | "price"
>;

export type BookingStaffOption = Pick<StaffRow, "id" | "shop_id" | "name">;

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export type BookingFormData = {
  shop_id: string;
  service_id: string;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  notes: string;
};

export type PublicBookingFormData = {
  shop_id: string;
  service_id: string;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  notes?: string;
};

export type TimeSlot = {
  start_time: string;
  end_time: string;
  staff_id: string | null;
  staff_name: string | null;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
