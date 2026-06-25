"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { ServiceActionState } from "./types";

type ServicePayload =
  | { error: string; data?: never }
  | {
      error?: never;
      data: {
        shop_id: string;
        name: string;
        description: string | null;
        price: number;
        duration_minutes: number;
        is_active: boolean;
      };
    };

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableFormString(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  return value.length > 0 ? value : null;
}

function getPositiveInteger(formData: FormData, key: string) {
  const value = Number.parseInt(getFormString(formData, key), 10);

  return Number.isFinite(value) ? value : 0;
}

function getServicePayload(formData: FormData): ServicePayload {
  const shopId = getFormString(formData, "shop_id");
  const name = getFormString(formData, "name");
  const description = getNullableFormString(formData, "description");
  const price = getPositiveInteger(formData, "price");
  const durationMinutes = getPositiveInteger(formData, "duration_minutes");
  const isActive = formData.get("is_active") === "on";

  if (!shopId) {
    return { error: "Vui lòng chọn cửa hàng cho dịch vụ." };
  }

  if (!name) {
    return { error: "Tên dịch vụ là bắt buộc." };
  }

  if (price <= 0) {
    return { error: "Giá dịch vụ phải lớn hơn 0." };
  }

  if (durationMinutes <= 0) {
    return { error: "Thời lượng dịch vụ phải lớn hơn 0 phút." };
  }

  return {
    data: {
      shop_id: shopId,
      name,
      description,
      price,
      duration_minutes: durationMinutes,
      is_active: isActive,
    },
  };
}

function getFriendlyError(message: string) {
  if (message.includes("foreign key")) {
    return "Cửa hàng không hợp lệ hoặc không thuộc tài khoản hiện tại.";
  }

  return "Không thể lưu dịch vụ. Vui lòng thử lại.";
}

async function revalidateServicePaths(shopId?: string | null) {
  revalidatePath("/services");
  revalidatePath("/dashboard");
  revalidatePath("/bookings");

  if (!shopId) {
    return;
  }

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId)
    .maybeSingle();

  if (shop?.slug) {
    revalidatePath(`/${shop.slug}`);
  }
}

export async function createService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const payload = getServicePayload(formData);

  if (payload.error !== undefined) {
    return { status: "error", message: payload.error };
  }

  const supabase = await createClient();
  const { data: service, error } = await supabase
    .from("services")
    .insert(payload.data)
    .select("shop_id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: getFriendlyError(error.message) };
  }

  if (!service) {
    return {
      status: "error",
      message: "Không thể tạo dịch vụ cho cửa hàng hiện tại.",
    };
  }

  await revalidateServicePaths(service.shop_id);

  return { status: "success", message: "Đã tạo dịch vụ." };
}

export async function updateService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const serviceId = getFormString(formData, "service_id");
  const payload = getServicePayload(formData);

  if (!serviceId) {
    return { status: "error", message: "Thiếu ID dịch vụ." };
  }

  if (payload.error !== undefined) {
    return { status: "error", message: payload.error };
  }

  const supabase = await createClient();
  const { data: service, error } = await supabase
    .from("services")
    .update(payload.data)
    .eq("id", serviceId)
    .select("shop_id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: getFriendlyError(error.message) };
  }

  if (!service) {
    return {
      status: "error",
      message:
        "Không tìm thấy dịch vụ thuộc cửa hàng của tài khoản hiện tại.",
    };
  }

  await revalidateServicePaths(service.shop_id);

  return { status: "success", message: "Đã cập nhật dịch vụ." };
}

export async function toggleServiceStatus(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const serviceId = getFormString(formData, "service_id");
  const nextStatus = formData.get("is_active") === "true";

  if (!serviceId) {
    return { status: "error", message: "Thiếu ID dịch vụ." };
  }

  const supabase = await createClient();
  const { data: service, error } = await supabase
    .from("services")
    .update({ is_active: nextStatus })
    .eq("id", serviceId)
    .select("shop_id")
    .maybeSingle();

  if (error || !service) {
    return {
      status: "error",
      message: "Không thể cập nhật trạng thái dịch vụ.",
    };
  }

  await revalidateServicePaths(service.shop_id);

  return {
    status: "success",
    message: nextStatus ? "Đã kích hoạt dịch vụ." : "Đã ẩn dịch vụ.",
  };
}

export async function deleteService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const serviceId = getFormString(formData, "service_id");

  if (!serviceId) {
    return { status: "error", message: "Thiếu ID dịch vụ." };
  }

  const supabase = await createClient();
  const { data: deletedService, error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .select("shop_id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message:
        "Không thể xóa dịch vụ. Nếu dịch vụ đã có lịch hẹn, hãy ẩn dịch vụ thay vì xóa.",
    };
  }

  if (!deletedService) {
    return {
      status: "error",
      message: "Không tìm thấy dịch vụ thuộc cửa hàng của tài khoản hiện tại.",
    };
  }

  await revalidateServicePaths(deletedService.shop_id);

  return { status: "success", message: "Đã xóa dịch vụ." };
}
