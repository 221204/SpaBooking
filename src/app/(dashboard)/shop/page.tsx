import { ShopManager } from "@/features/shop/components/ShopManager";
import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shops } = user
    ? await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cửa hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tất cả spa thuộc tài khoản của bạn. Mỗi cửa hàng có trang đặt
          lịch công khai riêng theo slug.
        </p>
      </div>

      <ShopManager shops={shops ?? []} />
    </div>
  );
}
