"use client";

type SectionNumberProps = {
  num: string;
  className?: string;
};

export function SectionNumber({ num, className = "" }: SectionNumberProps) {
  return (
    <span
      className={`pointer-events-none absolute z-0 select-none font-display text-[clamp(8rem,20vw,16rem)] leading-none tracking-[-0.04em] text-ink/[0.025] ${className}`}
      aria-hidden
    >
      {num}
    </span>
  );
}
