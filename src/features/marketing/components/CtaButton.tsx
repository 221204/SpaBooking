import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-11 items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
        variant === "primary" &&
          "bg-[#3d5c4e] text-[#f4f7f5] shadow-[0_20px_50px_-20px_rgba(61,92,78,0.55)] hover:bg-[#345043]",
        variant === "ghost" &&
          "bg-white/60 text-[#18181b] ring-1 ring-[#18181b]/8 hover:bg-white/90",
        className,
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
          variant === "primary" ? "bg-white/15" : "bg-[#18181b]/5",
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="opacity-80"
        >
          <path
            d="M3 10L10 3M10 3H4M10 3V9"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
