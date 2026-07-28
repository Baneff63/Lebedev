"use client";

type CrosshairProps = {
  className?: string;
};

export function Crosshair({ className = "" }: CrosshairProps) {
  return (
    <div
      className={`pointer-events-none absolute h-16 w-16 ${className}`}
      aria-hidden
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-ink/10" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-ink/10" />
      <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40" />
    </div>
  );
}
