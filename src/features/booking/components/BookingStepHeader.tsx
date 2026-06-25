import { publicUi } from "@/features/marketing/lib/public-ui";
import { cn } from "@/lib/utils";

type BookingStepHeaderProps = {
  step: number;
  title: string;
  description?: string;
  className?: string;
};

export function BookingStepHeader({
  step,
  title,
  description,
  className,
}: BookingStepHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-3 sm:mb-10", className)}>
      <span className={publicUi.eyebrow}>Bước {step}</span>
      <h2 className="text-2xl font-medium tracking-tight text-[#111110] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-[#525252] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
