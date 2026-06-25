import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BookingFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function BookingFormSection({
  title,
  description,
  children,
  className,
}: BookingFormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] bg-[#18181b]/[0.04] p-1.5 ring-1 ring-[#18181b]/5",
        className,
      )}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] sm:p-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-[#18181b]">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-[#71717a]">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
