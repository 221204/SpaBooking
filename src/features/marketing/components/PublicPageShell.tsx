import type { ReactNode } from "react";

import { MarketingNav } from "@/features/marketing/components/MarketingNav";
import { publicUi } from "@/features/marketing/lib/public-ui";
import { cn } from "@/lib/utils";

type PublicPageShellProps = {
  children: ReactNode;
  shopName?: string;
  className?: string;
  mainClassName?: string;
};

export function PublicPageShell({
  children,
  shopName,
  className,
  mainClassName,
}: PublicPageShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-[100dvh] bg-[#fbfcfb] text-[#111110] selection:bg-[#022c22] selection:text-white",
        className,
      )}
    >
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="pointer-events-none absolute -left-40 top-0 size-[40rem] rounded-full bg-[#e2e8e4]/60 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-32 size-80 rounded-full bg-[#c8d5cc]/35 blur-3xl" />

      <MarketingNav shopName={shopName} />

      <main className={cn(publicUi.shell, mainClassName)}>{children}</main>
    </div>
  );
}
