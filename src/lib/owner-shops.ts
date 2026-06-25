import { createClient } from "@/lib/supabase/server";

export type OwnerShop = {
  id: string;
  name: string;
  slug: string;
};

export async function getOwnerShops(): Promise<{
  shops: OwnerShop[];
  shopIds: string[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { shops: [], shopIds: [], error: null };
  }

  const { data: shops, error } = await supabase
    .from("shops")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .order("name");

  if (error) {
    return { shops: [], shopIds: [], error: error.message };
  }

  const resolvedShops = shops ?? [];

  return {
    shops: resolvedShops,
    shopIds: resolvedShops.map((shop) => shop.id),
    error: null,
  };
}
