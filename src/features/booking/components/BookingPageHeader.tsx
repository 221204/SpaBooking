import Link from "next/link";
import { MapPinIcon, Clock3Icon } from "lucide-react";

import { formatDisplayTime } from "@/features/booking/lib/dates";
import type { PublicShop } from "@/features/booking/types";
import { RevealOnScroll } from "@/features/marketing/components/RevealOnScroll";
import { publicUi } from "@/features/marketing/lib/public-ui";

type BookingPageHeaderProps = {
  shop: PublicShop;
};

export function BookingPageHeader({ shop }: BookingPageHeaderProps) {
  return (
    <RevealOnScroll>
      <header className="mb-12 max-w-3xl space-y-6 lg:mb-16">
        <Link
          href="/shops"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#525252] transition-colors duration-500 hover:text-[#022c22]"
        >
          <span aria-hidden="true">←</span>
          Quay lại cửa hàng
        </Link>

        <div className="space-y-4">
          <span className={publicUi.eyebrow}>Đặt lịch trực tuyến</span>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-medium leading-tight tracking-tight text-[#111110]">
            {shop.name}
          </h1>
        </div>

        <div className="flex flex-col gap-3 text-sm text-[#525252] sm:flex-row sm:flex-wrap sm:gap-6">
          {shop.address ? (
            <p className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 stroke-[1.5] text-[#022c22]/70" />
              <span className="leading-relaxed">{shop.address}</span>
            </p>
          ) : null}
          <p className="flex items-center gap-2 font-medium text-[#022c22]">
            <Clock3Icon className="size-4 stroke-[1.5]" />
            {formatDisplayTime(shop.open_time ?? "08:00")} –{" "}
            {formatDisplayTime(shop.close_time ?? "20:00")}
          </p>
        </div>
      </header>
    </RevealOnScroll>
  );
}
