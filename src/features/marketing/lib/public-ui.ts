/** Shared tokens for public marketing + booking surfaces */
export const publicUi = {
  accent: "#022c22",
  accentHover: "#011a14",
  canvas: "#fbfcfb",
  ink: "#111110",
  muted: "#525252",
  shell: "mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32",
  sectionGap: "space-y-20 sm:space-y-24",
  eyebrow:
    "inline-flex rounded-full bg-[#022c22]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#022c22]",
  bezelOuter: "rounded-[2rem] bg-[#111110]/[0.02] p-2 ring-1 ring-[#111110]/5",
  bezelInner:
    "rounded-[calc(2rem-0.5rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,1)]",
  transition: "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
} as const;
