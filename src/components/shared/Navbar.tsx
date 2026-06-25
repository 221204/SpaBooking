import Link from "next/link";

import { cn } from "@/lib/utils";

type NavbarProps = {
  shopName: string;
  className?: string;
};

export function Navbar({ shopName, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {shopName}
        </Link>
        <p className="text-xs text-muted-foreground">Đặt lịch trực tuyến</p>
      </div>
    </header>
  );
}
