import { CtaButton } from "@/features/marketing/components/CtaButton";
import { PublicPageShell } from "@/features/marketing/components/PublicPageShell";
import { RevealOnScroll } from "@/features/marketing/components/RevealOnScroll";
import { ShopCard } from "@/features/marketing/components/ShopCard";
import type { PublicShop } from "@/features/booking/types";

export function ShopListingPage({ shops }: { shops: PublicShop[] }) {
  return (
    <PublicPageShell>
      <RevealOnScroll>
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex rounded-full bg-[#022c22]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#022c22]">
            Đặt lịch spa
          </span>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-tight tracking-tight text-[#111110]">
            Chọn cửa hàng để đặt lịch
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#525252] sm:text-lg">
            Mỗi cửa hàng có trang đặt lịch riêng — chọn dịch vụ, nhân viên và
            khung giờ phù hợp với bạn.
          </p>
        </div>
      </RevealOnScroll>

      {shops.length === 0 ? (
        <RevealOnScroll>
          <div className="rounded-[2rem] bg-[#18181b]/[0.04] p-2 ring-1 ring-[#18181b]/5">
            <div className="rounded-[calc(2rem-0.375rem)] bg-white px-8 py-16 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              <h2 className="text-xl font-semibold tracking-tight">
                Chưa có cửa hàng
              </h2>
              <p className="mt-2 text-sm text-[#71717a]">
                Các spa sẽ xuất hiện tại đây khi được thêm vào hệ thống.
              </p>
              <div className="mt-6 flex justify-center">
                <CtaButton href="/" variant="ghost">
                  Về trang chủ
                </CtaButton>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      ) : (
        <div className="space-y-6">
          {shops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))}
        </div>
      )}
    </PublicPageShell>
  );
}
