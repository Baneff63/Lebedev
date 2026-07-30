"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLocale, useApp } from "@/context/LocaleContext";
import { AudioVisualizer, WaveformLine } from "@/components/effects/AudioVisualizer";
import { Crosshair } from "@/components/effects/Crosshair";
import { Magnetic } from "@/components/ui/Magnetic";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  const { t } = useLocale();
  const { isLoaded } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const offRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.7 })
        .from(
          ".hero-line",
          { y: 80, opacity: 0, duration: 1.1, stagger: 0.12 },
          "-=0.35",
        )
        .from(".hero-sub", { y: 24, opacity: 0, duration: 0.8 }, "-=0.55")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.5")
        .from(".hero-meta", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
        .from(".hero-scroll", { opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-status", { x: -20, opacity: 0, duration: 0.7 }, "-=0.6");

      gsap.to(".hero-accent-line", {
        scaleX: 1,
        duration: 1.4,
        ease: "power3.inOut",
        delay: 0.6,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t, isLoaded]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;

      if (parallaxRef.current) {
        gsap.to(parallaxRef.current, {
          x: cx * 14,
          y: cy * 8,
          duration: 0.8,
          ease: "power2.out",
        });
      }
      if (offRef.current) {
        gsap.to(offRef.current, {
          x: cx * -24,
          y: cy * -16,
          duration: 1.2,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-5 pt-32 pb-16 md:px-10 md:pb-20"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden />
      <AudioVisualizer />
      <WaveformLine />
      <Crosshair className="top-[20%] left-[6%] hidden lg:block" />
      <Crosshair className="right-[10%] bottom-[22%] hidden opacity-50 lg:block" />

      <div
        ref={offRef}
        className="pointer-events-none absolute top-[14%] right-[-6%] select-none font-display text-[clamp(7rem,18vw,15rem)] leading-none text-ink/[0.03] italic will-change-transform"
        aria-hidden
      >
        mix
      </div>

      <div className="hero-status absolute top-32 right-5 flex items-center gap-2.5 md:right-10 md:top-36">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-blink" />
        <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
          {t.hero.status}
        </span>
      </div>

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-0">
          <div className="md:col-span-1 md:col-start-1">
            <p className="hero-eyebrow text-[11px] uppercase tracking-[0.25em] text-muted [writing-mode:vertical-lr] md:rotate-180">
              {t.hero.eyebrow}
            </p>
          </div>

          <div ref={parallaxRef} className="will-change-transform md:col-span-10 md:col-start-2">
            <h1 className="font-display leading-[0.95] tracking-[-0.03em] text-ink">
              <span className="hero-line block text-[clamp(2.25rem,6.5vw,4.5rem)]">
                {t.hero.line1}
              </span>
              <span className="hero-line block text-[clamp(2.25rem,6.5vw,4.5rem)]">
                {t.hero.line2}
              </span>
              <span className="hero-line block text-[clamp(3rem,9vw,6.5rem)] text-accent italic">
                {t.hero.line3}
              </span>
            </h1>

            <div
              className="hero-accent-line mt-8 h-px w-full max-w-[220px] origin-left scale-x-0 bg-accent"
              aria-hidden
            />

            <p className="hero-sub mt-8 max-w-[480px] text-[15px] leading-[1.75] tracking-[0.01em] text-muted md:text-[16px]">
              {t.hero.subheadline}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Magnetic strength={0.2} className="hero-cta">
                <button
                  type="button"
                  onClick={() => scrollToId("contact")}
                  data-cursor
                  className="inline-flex h-[52px] items-center gap-3 rounded-full border border-ink bg-ink px-7 text-[12px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
                >
                  {t.hero.ctaPrimary}
                </button>
              </Magnetic>

              <button
                type="button"
                onClick={() => scrollToId("work")}
                data-cursor
                data-cursor-label="play"
                className="hero-cta group inline-flex h-[52px] items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-ink"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors group-hover:border-accent group-hover:text-accent">
                  <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" aria-hidden>
                    <path d="M0.5 0.5l8 5-8 5V0.5z" />
                  </svg>
                </span>
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 md:mt-24">
          <p className="hero-meta text-[11px] leading-relaxed tracking-[0.1em] text-muted uppercase">
            {t.hero.trust}
          </p>

          <a
            href="#about"
            data-cursor
            data-cursor-label="scroll"
            className="hero-scroll group flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            <span className="inline-block h-8 w-px origin-top scale-y-0 bg-accent transition-transform duration-700 ease-out-expo group-hover:scale-y-100" />
          </a>
        </div>
      </div>
    </section>
  );
}
