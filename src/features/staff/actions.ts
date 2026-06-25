"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database.types";

import type {
  ActionResult,
  ScheduleFormData,
  StaffFormData,
  StaffWithSchedules,
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

async function revalidateStaffPaths(shopIds: string[]) {
  revalidatePath("/staff");
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

function validateSchedule(formData: ScheduleFormData): string | null {
  if (formData.day_of_week < 0 || formData.day_of_week > 6) {
    return "Ngày trong tuần không hợp lệ (0-6).";
  }

  if (formData.start_time >= formData.end_time) {
    return "Giờ bắt đầu phải sớm hơn giờ kết thúc.";
  }

  return null;
}

async function getStaffShopId(
  supabase: OwnerContext["supabase"],
  staffId: string,
  shopIds: string[],
) {
  const { data: staff } = await supabase
    .from("staff")
    .select("shop_id")
    .eq("id", staffId)
    .maybeSingle();

  if (!staff?.shop_id || !shopIds.includes(staff.shop_id)) {
    return null;
  }

  return staff.shop_id;
}

export async function getStaffList(): Promise<StaffWithSchedules[]> {
  const { supabase, shopIds } = await getOwnerContext();

  if (shopIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("staff")
    .select("*, staff_schedules(*)")
    .in("shop_id", shopIds)
    .order("shop_id", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((member) => ({
    ...member,
    staff_schedules: [...(member.staff_schedules ?? [])].sort((a, b) => {
      const dayDiff = (a.day_of_week ?? 0) - (b.day_of_week ?? 0);
      if (dayDiff !== 0) {
        return dayDiff;
      }

      return a.start_time.localeCompare(b.start_time);
    }),
  })) as StaffWithSchedules[];
}

export async function createStaff(
  formData: StaffFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();

    if (!shopIds.includes(formData.shop_id)) {
      return { success: false, error: "Cửa hàng không hợp lệ." };
    }

    if (!formData.name.trim()) {
      return { success: false, error: "Tên nhân viên là bắt buộc." };
    }

    const payload: TablesInsert<"staff"> = {
      shop_id: formData.shop_id,
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("staff")
      .insert(payload)
      .select("id, shop_id")
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Không thể tạo nhân viên.",
      };
    }

    await revalidateStaffPaths([data.shop_id ?? formData.shop_id]);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tạo nhân viên.",
    };
  }
}

export async function updateStaff(
  staffId: string,
  formData: StaffFormData,
): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getStaffShopId(supabase, staffId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy nhân viên." };
    }

    if (!formData.name.trim()) {
      return { success: false, error: "Tên nhân viên là bắt buộc." };
    }

    if (!shopIds.includes(formData.shop_id)) {
      return { success: false, error: "Cửa hàng không hợp lệ." };
    }

    const { data, error } = await supabase
      .from("staff")
      .update({
        shop_id: formData.shop_id,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
      })
      .eq("id", staffId)
      .eq("shop_id", shopId)
      .select("shop_id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể cập nhật nhân viên." };
    }

    await revalidateStaffPaths([shopId, formData.shop_id]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật nhân viên.",
    };
  }
}

export async function deleteStaff(staffId: string): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getStaffShopId(supabase, staffId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy nhân viên." };
    }

    const { data, error } = await supabase
      .from("staff")
      .delete()
      .eq("id", staffId)
      .eq("shop_id", shopId)
      .select("shop_id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể xóa nhân viên." };
    }

    await revalidateStaffPaths([shopId]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể xóa nhân viên.",
    };
  }
}

export async function toggleStaffActive(staffId: string): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getStaffShopId(supabase, staffId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy nhân viên." };
    }

    const { data: staff, error: fetchError } = await supabase
      .from("staff")
      .select("is_active")
      .eq("id", staffId)
      .eq("shop_id", shopId)
      .maybeSingle();

    if (fetchError || !staff) {
      return {
        success: false,
        error: fetchError?.message ?? "Không tìm thấy nhân viên.",
      };
    }

    const { data: updatedStaff, error } = await supabase
      .from("staff")
      .update({ is_active: !staff.is_active })
      .eq("id", staffId)
      .eq("shop_id", shopId)
      .select("shop_id")
      .maybeSingle();

    if (error || !updatedStaff) {
      return { success: false, error: error?.message ?? "Không thể đổi trạng thái." };
    }

    await revalidateStaffPaths([shopId]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Không thể thay đổi trạng thái nhân viên.",
    };
  }
}

export async function addStaffSchedule(
  staffId: string,
  formData: ScheduleFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();
    const shopId = await getStaffShopId(supabase, staffId, shopIds);

    if (!shopId) {
      return { success: false, error: "Không tìm thấy nhân viên." };
    }

    const scheduleError = validateSchedule(formData);
    if (scheduleError) {
      return { success: false, error: scheduleError };
    }

    const { data, error } = await supabase
      .from("staff_schedules")
      .insert({
        staff_id: staffId,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Không thể thêm lịch làm việc.",
      };
    }

    await revalidateStaffPaths([shopId]);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể thêm lịch làm việc.",
    };
  }
}

export async function deleteStaffSchedule(scheduleId: string): Promise<ActionResult> {
  try {
    const { supabase, shopIds } = await requireOwnerContext();

    const { data: schedule, error: scheduleError } = await supabase
      .from("staff_schedules")
      .select("staff_id")
      .eq("id", scheduleId)
      .maybeSingle();

    if (scheduleError || !schedule?.staff_id) {
      return { success: false, error: "Không tìm thấy lịch làm việc." };
    }

    const shopId = await getStaffShopId(supabase, schedule.staff_id, shopIds);
    if (!shopId) {
      return { success: false, error: "Không có quyền xóa lịch này." };
    }

    const { data, error } = await supabase
      .from("staff_schedules")
      .delete()
      .eq("id", scheduleId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không thể xóa lịch làm việc." };
    }

    await revalidateStaffPaths([shopId]);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể xóa lịch làm việc.",
    };
  }
}
