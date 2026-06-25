"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { ShopActionState } from "./types";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableFormString(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  return value.length > 0 ? value : null;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ShopPayload =
  | { error: string; data?: never }
  | {
      error?: never;
      data: {
        name: string;
        slug: string;
        address: string | null;
        open_time: string;
        close_time: string;
      };
    };

function getShopPayload(formData: FormData): ShopPayload {
  const name = getFormString(formData, "name");
  const slug = normalizeSlug(getFormString(formData, "slug") || name);
  const address = getNullableFormString(formData, "address");
  const openTime = getFormString(formData, "open_time") || "08:00";
  const closeTime = getFormString(formData, "close_time") || "20:00";

  if (!name) {
    return { error: "Tên cửa hàng là bắt buộc." };
  }

  if (!slug) {
    return { error: "Slug cửa hàng là bắt buộc." };
  }

  if (openTime >= closeTime) {
    return { error: "Giờ mở cửa phải sớm hơn giờ đóng cửa." };
  }

  return {
    data: {
      name,
      slug,
      address,
      open_time: openTime,
      close_time: closeTime,
    },
  };
}

function getFriendlyError(message: string) {
  if (message.includes("duplicate key") || message.includes("shops_slug_key")) {
    return "Slug này đã được sử dụng. Vui lòng chọn slug khác.";
  }

  return "Không thể lưu cửa hàng. Vui lòng thử lại.";
}

async function revalidateShopPaths(slug?: string, previousSlug?: string) {
  revalidatePath("/shop");
  revalidatePath("/dashboard");
  revalidatePath("/services");
  revalidatePath("/staff");
  revalidatePath("/bookings");

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`);
  }

  if (slug) {
    revalidatePath(`/${slug}`);
  }
}

export async function createShop(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const payload = getShopPayload(formData);

  if (payload.error !== undefined) {
    return { status: "error", message: payload.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: "Bạn cần đăng nhập để tạo cửa hàng." };
  }

  const { data: createdShop, error } = await supabase
    .from("shops")
    .insert({
      ...payload.data,
      owner_id: user.id,
    })
    .select("slug")
    .maybeSingle();

  if (error) {
    return { status: "error", message: getFriendlyError(error.message) };
  }

  if (!createdShop) {
    return {
      status: "error",
      message: "Không thể tạo cửa hàng. Vui lòng kiểm tra quyền truy cập (RLS).",
    };
  }

  await revalidateShopPaths(createdShop.slug);

  return { status: "success", message: "Đã tạo cửa hàng." };
}

export async function updateShop(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const shopId = getFormString(formData, "shop_id");
  const payload = getShopPayload(formData);

  if (!shopId) {
    return { status: "error", message: "Thiếu ID cửa hàng." };
  }

  if (payload.error !== undefined) {
    return { status: "error", message: payload.error };
  }

  const supabase = await createClient();

  const { data: existingShop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId)
    .maybeSingle();

  const { data: updatedShop, error } = await supabase
    .from("shops")
    .update(payload.data)
    .eq("id", shopId)
    .select("slug")
    .maybeSingle();

  if (error) {
    return { status: "error", message: getFriendlyError(error.message) };
  }

  if (!updatedShop) {
    return {
      status: "error",
      message:
        "Không tìm thấy cửa hàng thuộc tài khoản hiện tại. Vui lòng đăng nhập lại hoặc kiểm tra owner_id.",
    };
  }

  await revalidateShopPaths(updatedShop.slug, existingShop?.slug ?? undefined);

  return { status: "success", message: "Đã cập nhật cửa hàng." };
}

export async function deleteShop(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const shopId = getFormString(formData, "shop_id");

  if (!shopId) {
    return { status: "error", message: "Thiếu ID cửa hàng." };
  }

  const supabase = await createClient();

  const { data: existingShop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId)
    .maybeSingle();

  const { data: deletedShop, error } = await supabase
    .from("shops")
    .delete()
    .eq("id", shopId)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: "Không thể xóa cửa hàng. Vui lòng thử lại.",
    };
  }

  if (!deletedShop) {
    return {
      status: "error",
      message: "Không tìm thấy cửa hàng thuộc tài khoản hiện tại.",
    };
  }

  await revalidateShopPaths(undefined, existingShop?.slug ?? undefined);

  return { status: "success", message: "Đã xóa cửa hàng." };
}
