import { ServiceManager } from "@/features/services/components/ServiceManager";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shops } = user
    ? await supabase
        .from("shops")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const shopIds = shops?.map((shop) => shop.id) ?? [];

  const { data: services } =
    shopIds.length > 0
      ? await supabase
          .from("services")
          .select("*")
          .in("shop_id", shopIds)
          .order("shop_id", { ascending: true })
          .order("is_active", { ascending: false })
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dịch vụ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý dịch vụ theo từng cửa hàng. Chỉ dịch vụ{" "}
          <strong className="font-medium text-foreground">đang hoạt động</strong>{" "}
          hiển thị trên trang đặt lịch công khai (theo RLS Supabase).
        </p>
      </div>

      <ServiceManager services={services ?? []} shops={shops ?? []} />
    </div>
  );
}
