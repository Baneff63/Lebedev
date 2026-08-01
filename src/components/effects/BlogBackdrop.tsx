export function BlogBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="scanlines absolute inset-0 opacity-40" />

      <div
        className="absolute top-0 left-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />

      <p className="absolute -top-10 right-[-2%] select-none font-display text-[clamp(8rem,20vw,16rem)] leading-none text-ink/[0.025] italic">
        &ldquo;
      </p>
    </div>
  );
}
