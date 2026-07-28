"use client";

import { useLocale } from "@/context/LocaleContext";

type MarqueeProps = {
  reverse?: boolean;
  variant?: "default" | "accent" | "outline";
};

export function Marquee({ reverse = false, variant = "default" }: MarqueeProps) {
  const { t } = useLocale();
  const items = [...t.marquee, ...t.marquee];

  const variantClass = {
    default: "border-ink/8 bg-paper text-muted",
    accent: "border-accent/20 bg-accent/[0.04] text-ink/60",
    outline: "border-ink/8 bg-transparent text-ink/[0.07]",
  }[variant];

  const textClass = {
    default: "text-[11px] tracking-[0.22em]",
    accent: "text-[11px] tracking-[0.22em]",
    outline: "font-display text-[clamp(3rem,8vw,6rem)] tracking-[-0.02em] lowercase italic",
  }[variant];

  return (
    <div
      className={`overflow-hidden border-y py-3.5 md:py-4 ${variantClass}`}
      aria-hidden
    >
      <div
        className={`flex w-max items-center gap-8 md:gap-12 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`shrink-0 ${variant === "outline" ? "" : "uppercase"} ${textClass}`}
          >
            {variant === "outline" ? item : `${item} ·`}
          </span>
        ))}
      </div>
    </div>
  );
}
