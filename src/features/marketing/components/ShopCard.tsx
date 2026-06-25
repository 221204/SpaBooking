import Link from "next/link";

import { CtaButton } from "@/features/marketing/components/CtaButton";
import { RevealOnScroll } from "@/features/marketing/components/RevealOnScroll";
import type { PublicShop } from "@/features/booking/types";

function formatTime(time: string | null) {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

export function ShopCard({
  shop,
  index,
}: {
  shop: PublicShop;
  index: number;
}) {
  const hours =
    shop.open_time && shop.close_time
      ? `${formatTime(shop.open_time)} – ${formatTime(shop.close_time)}`
      : "Giờ mở cửa sẽ được cập nhật";

  return (
    <RevealOnScroll delay={index * 80}>
      <article className="group rounded-[2rem] bg-[#18181b]/[0.04] p-2 ring-1 ring-[#18181b]/5">
        <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="relative min-h-52 overflow-hidden md:min-h-full">
              <img
                src={`https://picsum.photos/seed/${shop.id}/800/600`}
                alt=""
                className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181b]/30 to-transparent md:bg-gradient-to-r" />
            </div>

            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="space-y-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#71717a]">
                  Spa & wellness
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#18181b] sm:text-3xl">
                  {shop.name}
                </h2>
                <p className="text-sm leading-relaxed text-[#71717a]">
                  {shop.address ?? "Địa chỉ sẽ được cập nhật"}
                </p>
                <p className="text-sm font-medium text-[#3d5c4e]">{hours}</p>
              </div>

              <CtaButton href={`/${shop.slug}`}>Đặt lịch tại đây</CtaButton>
            </div>
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}

export function ShopCardCompact({ shop }: { shop: PublicShop }) {
  return (
    <Link
      href={`/${shop.slug}`}
      className="group block rounded-[2rem] bg-[#18181b]/[0.04] p-1.5 ring-1 ring-[#18181b]/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[#3d5c4e]/25"
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#71717a]">
          Cửa hàng
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#18181b] transition-colors duration-500 group-hover:text-[#3d5c4e]">
          {shop.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#71717a]">
          {shop.address ?? "Địa chỉ sẽ được cập nhật"}
        </p>
      </div>
    </Link>
  );
}
