import { ShopListingPage } from "@/features/marketing/components/ShopListingPage";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cửa hàng | Serene",
  description: "Chọn spa và wellness để đặt lịch trực tuyến.",
};

export default async function ShopsPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select("id, name, slug, address, open_time, close_time")
    .order("name", { ascending: true });

  return <ShopListingPage shops={shops ?? []} />;
}
