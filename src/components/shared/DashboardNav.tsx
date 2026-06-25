"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  dashboardNavItems,
  isDashboardNavActive,
} from "@/components/shared/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  variant: "sidebar" | "mobile";
};

export function DashboardNav({ variant }: DashboardNavProps) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className="space-y-1">
        {dashboardNavItems.map((item) => {
          const active = isDashboardNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
      {dashboardNavItems.map((item) => {
        const active = isDashboardNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
