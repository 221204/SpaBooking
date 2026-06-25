import { NoShopPrompt } from "@/components/shared/NoShopPrompt";
import { StaffManager } from "@/features/staff/components/StaffManager";
import { getStaffList } from "@/features/staff/actions";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
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

  const staff = shops && shops.length > 0 ? await getStaffList() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nhân viên</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý nhân viên và lịch làm việc theo cửa hàng. Chỉ nhân viên{" "}
          <strong className="font-medium text-foreground">đang hoạt động</strong>{" "}
          hiển thị trên trang đặt lịch công khai (theo RLS Supabase).
        </p>
      </div>

      {!shops || shops.length === 0 ? (
        <NoShopPrompt feature="nhân viên" />
      ) : (
        <StaffManager shops={shops} initialStaff={staff} />
      )}
    </div>
  );
}
