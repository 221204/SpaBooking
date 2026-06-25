import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({
  className,
  label = "Đang tải...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="size-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
