"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLocale, useApp } from "@/context/LocaleContext";
import { AudioVisualizer, WaveformLine } from "@/components/effects/AudioVisualizer";
import { Crosshair } from "@/components/effects/Crosshair";

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

      tl.from(".hero-line", {
        y: 80,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
      })
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
          x: cx * 18,
          y: cy * 10,
          duration: 0.8,
          ease: "power2.out",
        });
      }
      if (offRef.current) {
        gsap.to(offRef.current, {
          x: cx * -30,
          y: cy * -20,
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
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden px-5 pb-10 pt-32 md:px-10 md:pb-16"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden />
      <AudioVisualizer />
      <WaveformLine />
      <Crosshair className="top-[22%] left-[8%] hidden md:block" />
      <Crosshair className="right-[12%] bottom-[28%] hidden opacity-50 md:block" />

      <div
        ref={offRef}
        className="pointer-events-none absolute top-[18%] right-[-5%] select-none font-display text-[clamp(8rem,22vw,18rem)] leading-none text-ink/[0.03] italic will-change-transform"
      >
        off
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
            <p className="hero-meta text-[11px] uppercase tracking-[0.25em] text-muted [writing-mode:vertical-lr] md:rotate-180">
              {t.hero.role}
            </p>
          </div>

          <div ref={parallaxRef} className="will-change-transform md:col-span-10 md:col-start-2">
            <h1 className="font-display leading-[0.92] tracking-[-0.03em] text-ink">
              <span className="hero-line block text-[clamp(2.5rem,7vw,5rem)] italic">
                {t.hero.line1}
              </span>
              <span className="hero-line block pl-[clamp(1rem,8vw,6rem)] text-[clamp(3rem,10vw,7.5rem)]">
                {t.hero.line2}
              </span>
              <span className="hero-line block text-[clamp(4rem,14vw,10rem)] text-accent">
                {t.hero.line3}
              </span>
            </h1>

            <div
              className="hero-accent-line mt-10 h-px w-full max-w-[280px] origin-left scale-x-0 bg-accent md:ml-[clamp(1rem,8vw,6rem)]"
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-16 flex items-end justify-between md:mt-24">
          <p className="hero-meta max-w-[200px] text-[11px] leading-relaxed tracking-[0.06em] text-muted uppercase">
            Daniil Lebedev
          </p>

          <a
            href="#about"
            data-cursor
            data-cursor-label="scroll"
            className="hero-scroll group flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            <span>{t.hero.scroll}</span>
            <span className="inline-block h-8 w-px origin-top scale-y-0 bg-accent transition-transform duration-700 ease-out-expo group-hover:scale-y-100" />
          </a>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 hidden h-12 w-12 -translate-x-1/2 rounded-full border border-ink/10 md:block"
        aria-hidden
      >
        <div className="absolute inset-1 animate-spin-slow rounded-full border border-dashed border-accent/20" />
      </div>
    </section>
  );
}
