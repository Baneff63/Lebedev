import { AmbientEqualizerField } from "./AmbientEqualizerField";

export function PortfolioBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden" aria-hidden>
      <div className="grid-bg absolute inset-0 opacity-30" />

      <div
        className="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full opacity-[0.05] blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--ink) 0%, transparent 70%)" }}
      />

      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/[0.04]" />

      {/* Subtle, continuously "filling" equalizer field along the bottom —
          decorative texture that matches the site's audio-engineering
          theme without competing with the grid content above it. */}
      <AmbientEqualizerField />

      <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 select-none font-display text-[clamp(6rem,18vw,14rem)] leading-none tracking-[-0.04em] text-ink/[0.025] italic">
        work
      </p>
    </div>
  );
}
