import Link from "next/link";

import { cn } from "@/lib/utils";

type MarketingNavProps = {
  shopName?: string;
  className?: string;
};

export function MarketingNav({ shopName, className }: MarketingNavProps) {
  return (
    <nav
      className={cn(
        "fixed top-6 left-0 right-0 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6",
        className,
      )}
    >
      <div className="mx-auto flex w-max max-w-full items-center gap-1 rounded-full bg-white/75 px-2 py-2 shadow-[0_8px_40px_-12px_rgba(24,24,27,0.18)] ring-1 ring-[#18181b]/6 backdrop-blur-xl">
        <Link
          href="/"
          className="rounded-full px-4 py-2 text-sm font-semibold tracking-tight text-[#111110] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#022c22]"
        >
          Serene
        </Link>

        {shopName ? (
          <span className="hidden max-w-40 truncate rounded-full px-3 py-2 text-sm text-[#525252] sm:inline">
            {shopName}
          </span>
        ) : null}

        <Link
          href="/shops"
          className="rounded-full px-4 py-2 text-sm text-[#525252] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#111110]"
        >
          Cửa hàng
        </Link>

        <Link
          href="/login"
          className="ml-1 rounded-full bg-[#111110]/5 px-4 py-2 text-sm font-medium text-[#111110] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#111110]/10 active:scale-[0.98]"
        >
          Quản trị
        </Link>
      </div>
    </nav>
  );
}
