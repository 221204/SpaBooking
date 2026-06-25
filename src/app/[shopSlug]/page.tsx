import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { BookingForm } from "@/features/booking/components/BookingForm";
import { PublicPageShell } from "@/features/marketing/components/PublicPageShell";
import type { PublicService, PublicStaff } from "@/features/booking/types";
import { createClient } from "@/lib/supabase/server";

type ShopPageProps = {
  params: Promise<{ shopSlug: string }>;
};

function PublicMessage({ children }: { children: ReactNode }) {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-xl rounded-[2rem] bg-[#111110]/[0.02] p-2 ring-1 ring-[#111110]/5">
        <div className="rounded-[calc(2rem-0.5rem)] bg-white px-6 py-12 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,1)] sm:px-8">
          {children}
        </div>
      </div>
    </PublicPageShell>
  );
}

export default async function PublicShopPage({ params }: ShopPageProps) {
  const { shopSlug } = await params;
  const supabase = await createClient();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, name, slug, address, open_time, close_time")
    .eq("slug", shopSlug)
    .maybeSingle();

  if (shopError || !shop) {
    notFound();
  }

  const [servicesResult, staffResult] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, price, duration_minutes")
      .eq("shop_id", shop.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("staff")
      .select("id, name, staff_schedules(day_of_week, start_time, end_time)")
      .eq("shop_id", shop.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (servicesResult.error || staffResult.error) {
    return (
      <PublicMessage>
        <p className="text-sm text-red-600">
          Không thể tải dữ liệu đặt lịch. Vui lòng thử lại sau.
        </p>
      </PublicMessage>
    );
  }

  const services = (servicesResult.data ?? []) as PublicService[];
  const staff = (staffResult.data ?? []) as PublicStaff[];
  const hasStaffSchedules = staff.some(
    (member) => (member.staff_schedules?.length ?? 0) > 0,
  );

  if (services.length === 0) {
    return (
      <PublicMessage>
        <p className="text-[#525252]">Cửa hàng chưa có dịch vụ để đặt lịch.</p>
      </PublicMessage>
    );
  }

  return (
    <PublicPageShell shopName={shop.name}>
      <BookingForm
        shop={shop}
        services={services}
        staff={staff}
        hasStaffSchedules={hasStaffSchedules}
      />
    </PublicPageShell>
  );
}
