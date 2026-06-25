import { CtaButton } from "@/features/marketing/components/CtaButton";
import { PublicPageShell } from "@/features/marketing/components/PublicPageShell";
import { RevealOnScroll } from "@/features/marketing/components/RevealOnScroll";
import {
  ShopCardCompact,
} from "@/features/marketing/components/ShopCard";
import type { PublicShop } from "@/features/booking/types";

const steps = [
  {
    title: "1. Chọn không gian",
    body: "Duyệt danh sách spa và wellness, so sánh địa điểm và giờ mở cửa trước khi quyết định.",
  },
  {
    title: "2. Chọn dịch vụ & giờ",
    body: "Xem dịch vụ đang hoạt động, chọn nhân viên nếu cần, và lấy slot trống theo thời gian thực.",
  },
  {
    title: "3. Xác nhận",
    body: "Điền thông tin liên hệ và nhận xác nhận từ spa sau khi gửi yêu cầu đặt lịch.",
  },
];

export function LandingPage({ featuredShops }: { featuredShops: PublicShop[] }) {
  return (
    <PublicPageShell>
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <RevealOnScroll>
          <div className="space-y-8">
            <h1 className="max-w-xl text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-tight">
              Thời gian cho
              <span className="text-[#022c22]"> bản thân</span>
              <span className="mx-2 inline-block size-10 align-middle overflow-hidden rounded-xl sm:size-12">
                <img
                  src="https://picsum.photos/seed/spa-hero/96/96"
                  alt=""
                  className="size-full object-cover"
                />
              </span>
              bắt đầu từ một lịch hẹn
            </h1>

            <p className="max-w-md text-base leading-relaxed text-[#525252] sm:text-lg">
              Kết nối bạn với các không gian spa và wellness — chọn cửa hàng, dịch vụ, và khung giờ phù hợp một cách nhẹ nhàng.
            </p>

            <CtaButton href="/shops" className="bg-[#022c22] text-white hover:bg-[#011a14] px-8 py-3 rounded-full font-medium transition-all">
              Khám phá không gian
            </CtaButton>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/6] ring-1 ring-black/5 shadow-xl">
            <img
              src="https://picsum.photos/seed/spa-ambient/900/1100"
              alt=""
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute right-8 bottom-8 left-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
                Trải nghiệm
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Slot trống thời gian thực
              </p>
              <p className="mt-1 text-sm text-white/90">
                Không cần gọi điện, chủ động chọn khung giờ phù hợp.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <section className="mt-24 sm:mt-32">
        <RevealOnScroll>
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Từ lựa chọn đến lịch hẹn
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#525252]">
              Mỗi bước được thiết kế tinh giản — không form dài, không phức tạp.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <RevealOnScroll
              key={step.title}
              delay={index * 60}
            >
              <div className="group h-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#111110]/5 transition-all hover:shadow-md hover:-translate-y-1">
                <h3 className="text-xl font-medium tracking-tight text-[#111110] group-hover:text-[#022c22] transition-colors">
                  {step.title}
                </h3>
                <p className="mt-3 text-[#525252] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {featuredShops.length > 0 ? (
        <section className="mt-24 sm:mt-32">
          <RevealOnScroll>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
                  Bắt đầu đặt lịch
                </h2>
              </div>
              <CtaButton href="/shops" variant="ghost" className="text-[#022c22] font-medium">
                Xem tất cả cửa hàng &rarr;
              </CtaButton>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredShops.slice(0, 3).map((shop) => (
              <RevealOnScroll key={shop.id} delay={80}>
                <ShopCardCompact shop={shop} />
              </RevealOnScroll>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-24 sm:mt-32">
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#022c22] px-8 py-16 text-center sm:px-12 sm:py-24">
            {/* Subtle grain overlay for premium feel */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            
            <h2 className="relative z-10 text-3xl font-medium tracking-tight text-white sm:text-4xl max-w-2xl mx-auto">
              Sẵn sàng cho buổi chăm sóc tiếp theo?
            </h2>
            <p className="relative z-10 mx-auto mt-4 max-w-lg text-lg text-white/80">
              Chọn spa gần bạn và gửi yêu cầu đặt lịch trong vài phút.
            </p>
            <div className="relative z-10 mt-10 flex justify-center">
              <CtaButton
                href="/shops"
                className="bg-white text-[#022c22] hover:bg-[#fbfcfb] px-8 py-3 rounded-full font-medium transition-all"
              >
                Đến trang cửa hàng
              </CtaButton>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="mt-24 border-t border-[#111110]/5 py-8 text-sm text-[#525252]">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>Serene — Spa booking</p>
          <p>Đặt lịch trực tuyến, quản trị dễ dàng</p>
        </div>
      </footer>
    </PublicPageShell>
  );
}
