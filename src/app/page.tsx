import { redirect } from "next/navigation";

import { LandingPage } from "@/features/marketing/components/LandingPage";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { data: shops } = await supabase
    .from("shops")
    .select("id, name, slug, address, open_time, close_time")
    .order("created_at", { ascending: false })
    .limit(3);

  return <LandingPage featuredShops={shops ?? []} />;
}
