"use client";

type VerticalLabelProps = {
  text: string;
  className?: string;
};

export function VerticalLabel({ text, className = "" }: VerticalLabelProps) {
  return (
    <span
      className={`pointer-events-none hidden text-[10px] tracking-[0.3em] text-muted/30 uppercase [writing-mode:vertical-lr] md:inline ${className}`}
      aria-hidden
    >
      {text}
    </span>
  );
}
