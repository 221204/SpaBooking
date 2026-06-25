import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/shared/DashboardNav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-4 md:block">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Spa Management
          </p>
          <p className="mt-1 truncate text-sm font-medium">{user.email}</p>
        </div>

        <DashboardNav variant="sidebar" />

        <form action={signOut} className="mt-8">
          <Button type="submit" variant="outline" className="w-full">
            Đăng xuất
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="text-sm font-medium">
              Spa Management
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Đăng xuất
              </Button>
            </form>
          </div>
          <DashboardNav variant="mobile" />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
