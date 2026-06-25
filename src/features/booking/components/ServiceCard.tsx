"use client";

import { Clock3Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicService } from "../types";

type ServiceCardProps = {
  service: PublicService;
  selected?: boolean;
  onSelect: (serviceId: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className="group w-full text-left outline-none transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
      aria-pressed={selected}
    >
      {/* Outer Shell (Double-Bezel) */}
      <div
        className={cn(
          "rounded-[2rem] p-2 ring-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
          selected
            ? "bg-[#022c22]/5 ring-[#022c22]/20 shadow-md shadow-[#022c22]/10"
            : "bg-[#111110]/[0.02] ring-[#111110]/5 group-hover:bg-[#111110]/[0.04]",
        )}
      >
        {/* Inner Core */}
        <div
          className={cn(
            "flex h-full flex-col justify-between rounded-[calc(2rem-0.5rem)] bg-white p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
            selected && "shadow-[inset_0_0_0_1px_#022c22] bg-[#fbfcfb]"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className={cn("text-base font-semibold tracking-tight transition-colors duration-700", selected ? "text-[#022c22]" : "text-[#111110]")}>
                {service.name}
              </h3>
              
              {/* Animated Check/Radio Circle */}
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  selected 
                    ? "border-[#022c22] bg-[#022c22] scale-110" 
                    : "border-[#111110]/10 bg-[#fbfcfb] group-hover:border-[#111110]/30"
                )}
              >
                <div className={cn(
                  "size-2.5 rounded-full bg-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  selected ? "scale-100" : "scale-0"
                )} />
              </div>
            </div>
            {service.description ? (
              <p className="text-sm leading-relaxed text-[#525252] line-clamp-2">
                {service.description}
              </p>
            ) : null}
          </div>
          
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#111110]/5 pt-4">
            <p className={cn("text-sm font-semibold tracking-tight", selected ? "text-[#022c22]" : "text-[#111110]")}>
              {formatCurrency(service.price)}
            </p>
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#525252]">
              <Clock3Icon className="size-3.5 opacity-60 stroke-[1.5]" aria-hidden="true" />
              {service.duration_minutes} phút
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
