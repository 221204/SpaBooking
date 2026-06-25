"use server";

import { revalidatePath } from "next/cache";

import {
  calculateAvailableSlots,
  calculateEndTime,
  calculateShopWideSlots,
} from "@/features/booking/lib/slots";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, TablesInsert } from "@/types/database.types";

import type {
  ActionResult,
  BookingFormData,
  BookingStaffOption,
  BookingWithRelations,
  PublicBookingFormData,
} from "./types";

type OwnerContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  shopIds: string[];
};

async function getOwnerContext(): Promise<OwnerContext & { userId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null, shopIds: [] };
  }

  const { data: shops } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id);

  return {
    supabase,
    userId: user.id,
    shopIds: shops?.map((shop) => shop.id) ?? [],
  };
}

async function requireOwnerContext(): Promise<OwnerContext & { userId: string }> {
  const context = await getOwnerContext();

  if (!context.userId || context.shopIds.length === 0) {
    throw new Error("Không tìm thấy cửa hàng của bạn.");
  }

  return {
    supabase: context.supabase,
    userId: context.userId,
    shopIds: context.shopIds,
  };
}

async function revalidateBookingPaths(shopIds: string[]) {
  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  if (shopIds.length === 0) {
    return;
  }

  const supabase = await createClient();
  const { data: shops } = await supabase
    .from("shops")
    .select("slug")
    .in("id", shopIds);

  for (const shop of shops ?? []) {
    if (shop.slug) {
      revalidatePath(`/${shop.slug}`);
    }
  }
}

async function getBookingShopId(
  supabase: OwnerContext["supabase"],
  bookingId: string,
  shopIds: string[],
) {
  const { data: booking } = await supabase
    .from("bookings")
    .select("shop_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking?.shop_id || !shopIds.includes(booking.shop_id)) {
    return null;
  }

  return booking.shop_id;
}

async function getServiceDuration(
  supabase: OwnerContext["supabase"],
  serviceId: string,
  shopId: string,
): Promise<number | null> {
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("shop_id", shopId)
    .maybeSingle();

  return service?.duration_minutes ?? null;
}

async function assertStaffInShop(
  supabase: OwnerContext["supabase"],
  staffId: string | null,
  shopId: string,
) {
  if (!staffId) {
    return true;
  }

  const { data: staffMember } = await supabase
    .from("staff")
    .select("id")
    .eq("id", staffId)
    .eq("shop_id", shopId)
    .maybeSingle();

  return Boolean(staffMember);
}

export async function getBookings(): Promise<BookingWithRelations[]> {
  const { supabase, shopIds } = await getOwnerContext();

  if (shopIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "*, services(id, name, duration_minutes, price), staff(id, name), shops(id, name)",
    )
    .in("shop_id", shopIds)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BookingWithRelations[];
}

export async function getBookingServices() {
  const { supabase, shopIds } = await getOwnerContext();

  if (shopIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select("id, shop_id, name, duration_minutes, price")
    .in("shop_id", shopIds)
    .order("shop_id", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getBookingStaff(): Promise<BookingStaffOption[]> {
  const { supabase, shopIds } = await getOwnerContext();

  if (shopIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("staff")
    .select("id, shop_id, name")
    .in("shop_id", shopIds)
    .eq("is_active", true)
    .order("shop_id", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createBooking(
  formData: BookingFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();

    if (!shopIds.includes(formData.shop_id)) {
      return { success: false, error: "Cửa hàng không hợp lệ." };
    }

    const duration = await getServiceDuration(
      supabase,
      formData.service_id,
      formData.shop_id,
    );

    if (duration === null) {
      return { success: false, error: "Dịch vụ không hợp lệ hoặc không thuộc cửa hàng đã chọn." };
    }

    const staffValid = await assertStaffInShop(
      supabase,
      formData.staff_id,
      formData.shop_id,
    );

    if (!staffValid) {
      return { success: false, error: "Nhân viên không thuộc cửa hàng đã chọn." };
    }

    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      return { success: false, error: "Tên và số điện thoại khách hàng là bắt buộc." };
    }

    const endTime = calculateEndTime(formData.start_time, duration);

    const payload: TablesInsert<"bookings"> = {
      shop_id: formData.shop_id,
      service_id: formData.service_id,
      staff_id: formData.staff_id || null,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      booking_date: formData.booking_date,
      start_time: formData.start_time,
      end_time: endTime,
      status: "pending",
      notes: formData.notes.trim() || null,
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert(payload)
      .select("id, shop_id")
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Không thể tạo lịch hẹn.",
      };
    }

    await revalidateBookingPaths([data.shop_id ?? formData.shop_id]);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tạo lịch hẹn.",
    };
  }
}

export async function createPublicBooking(
  formData: PublicBookingFormData,
): Promise<ActionResult<{ id: string; end_time: string }>> {
  const supabase = await createClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, slug, open_time, close_time")
    .eq("id", formData.shop_id)
    .maybeSingle();

  if (shopError || !shop) {
    return { success: false, error: "Không tìm thấy cửa hàng." };
  }

  if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
    return { success: false, error: "Tên và số điện thoại là bắt buộc." };
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, duration_minutes, is_active")
    .eq("id", formData.service_id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (serviceError || !service || !service.is_active) {
    return { success: false, error: "Dịch vụ không hợp lệ." };
  }

  if (formData.staff_id) {
    const { data: staffMember } = await supabase
      .from("staff")
      .select("id")
      .eq("id", formData.staff_id)
      .eq("shop_id", shop.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!staffMember) {
      return { success: false, error: "Nhân viên không hợp lệ." };
    }
  }

  const validation = await validateBookingSlot(supabase, {
    shopId: shop.id,
    serviceId: formData.service_id,
    staffId: formData.staff_id,
    bookingDate: formData.booking_date,
    startTime: formData.start_time,
    shopOpenTime: shop.open_time ?? "08:00",
    shopCloseTime: shop.close_time ?? "20:00",
    durationMinutes: service.duration_minutes,
  });

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const endTime = calculateEndTime(formData.start_time, service.duration_minutes);

  const payload: TablesInsert<"bookings"> = {
    shop_id: shop.id,
    service_id: formData.service_id,
    staff_id: formData.staff_id || null,
    customer_name: formData.customer_name.trim(),
    customer_phone: formData.customer_phone.trim(),
    booking_date: formData.booking_date,
    start_time: formData.start_time,
    end_time: endTime,
    status: "pending",
    notes: formData.notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể đặt lịch." };
  }

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  if (shop.slug) {
    revalidatePath(`/${shop.slug}`);
  }

  return { success: true, data: { id: data.id, end_time: endTime } };
}

export async function updateBooking(
  bookingId: string,
  formData: BookingFormData,
): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const currentShopId = await getBookingShopId(supabase, bookingId, shopIds);

    if (!currentShopId) {
      return { success: false, error: "Không tìm thấy lịch hẹn." };
    }

    if (!shopIds.includes(formData.shop_id)) {
      return { success: false, error: "Cửa hàng không hợp lệ." };
    }

    const duration = await getServiceDuration(
      supabase,
      formData.service_id,
      formData.shop_id,
    );

    if (duration === null) {
      return { success: false, error: "Dịch vụ không hợp lệ hoặc không thuộc cửa hàng đã chọn." };
    }

    const staffValid = await assertStaffInShop(
      supabase,
      formData.staff_id,
      formData.shop_id,
    );

    if (!staffValid) {
      return { success: false, error: "Nhân viên không thuộc cửa hàng đã chọn." };
    }

    const endTime = calculateEndTime(formData.start_time, duration);

    const { data, error } = await supabase
      .from("bookings")
      .update({
        shop_id: formData.shop_id,
        service_id: formData.service_id,
        staff_id: formData.staff_id || null,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: endTime,
        notes: formData.notes.trim() || null,
      })
      .eq("id", bookingId)
      .eq("shop_id", currentShopId)
      .select("shop_id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể cập nhật lịch hẹn." };
    }

    await revalidateBookingPaths([currentShopId, formData.shop_id]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật lịch hẹn.",
    };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getBookingShopId(supabase, bookingId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy lịch hẹn." };
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .eq("shop_id", shopId)
      .select("shop_id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể cập nhật trạng thái lịch hẹn." };
    }

    await revalidateBookingPaths([shopId]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái lịch hẹn.",
    };
  }
}

export async function deleteBooking(bookingId: string): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getBookingShopId(supabase, bookingId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy lịch hẹn." };
    }

    const { data, error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId)
      .eq("shop_id", shopId)
      .select("shop_id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể xóa lịch hẹn." };
    }

    await revalidateBookingPaths([shopId]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể xóa lịch hẹn.",
    };
  }
}

type ValidateSlotInput = {
  shopId: string;
  serviceId: string;
  staffId: string | null;
  bookingDate: string;
  startTime: string;
  shopOpenTime: string;
  shopCloseTime: string;
  durationMinutes: number;
};

export async function validateBookingSlot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: ValidateSlotInput,
): Promise<{ valid: true } | { valid: false; error: string }> {
  const { data: staffRows, error: staffError } = await supabase
    .from("staff")
    .select("id, name, staff_schedules(day_of_week, start_time, end_time)")
    .eq("shop_id", input.shopId)
    .eq("is_active", true);

  if (staffError) {
    return { valid: false, error: staffError.message };
  }

  const schedules = (staffRows ?? []).flatMap((member) =>
    (member.staff_schedules ?? []).map((schedule) => ({
      staff_id: member.id,
      staff_name: member.name,
      day_of_week: schedule.day_of_week ?? 0,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    })),
  );

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("staff_id, start_time, end_time")
    .eq("shop_id", input.shopId)
    .eq("booking_date", input.bookingDate)
    .neq("status", "cancelled");

  if (bookingsError) {
    return { valid: false, error: bookingsError.message };
  }

  const availableSlots =
    schedules.length > 0
      ? calculateAvailableSlots({
          date: input.bookingDate,
          serviceDurationMinutes: input.durationMinutes,
          shopOpenTime: input.shopOpenTime,
          shopCloseTime: input.shopCloseTime,
          schedules,
          existingBookings: bookings ?? [],
          staffId: input.staffId,
        })
      : input.staffId
        ? []
        : calculateShopWideSlots({
            serviceDurationMinutes: input.durationMinutes,
            shopOpenTime: input.shopOpenTime,
            shopCloseTime: input.shopCloseTime,
            existingBookings: bookings ?? [],
          });

  const normalizedStart = input.startTime.slice(0, 5);
  const isAvailable = availableSlots.some(
    (slot) =>
      slot.start_time.slice(0, 5) === normalizedStart &&
      (input.staffId ? slot.staff_id === input.staffId : true),
  );

  if (!isAvailable) {
    return { valid: false, error: "Khung giờ đã không còn trống." };
  }

  return { valid: true };
}
