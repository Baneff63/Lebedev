"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useLocale, useApp } from "@/context/LocaleContext";
import { Magnetic } from "@/components/ui/Magnetic";
import { AmbientEqualizerField } from "@/components/effects/AmbientEqualizerField";

export function HomeHero() {
  const { t } = useLocale();
  const { isLoaded } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  /*
   * BUG FIX: this used to be `useEffect`. The hero markup is present in
   * the DOM (fully visible, no hidden state of its own) from the very
   * first render — it just happens to sit underneath the opaque Loader
   * overlay while `isLoaded` is false. The entrance animation only runs
   * once `isLoaded` flips to true, and it works by calling
   * `gsap.from(...)`, which SETS the hidden/offset starting state itself
   * the moment it runs, then animates from there.
   *
   * `useEffect` runs *after* the browser has already painted the commit
   * that made this true. In that same commit, `isLoaded` becoming true
   * also unmounts the Loader (see Providers.tsx: `{!isLoaded && <Loader/>}`).
   * So the actual sequence was: Loader disappears → browser paints the
   * hero in its plain, fully-visible, non-animated state (this is the
   * "text appears immediately" the report described) → a frame later,
   * `useEffect` finally runs, `gsap.from()` snaps every line to
   * opacity:0/offset (the "then it disappears") → and only then does the
   * actual entrance tween play.
   *
   * `useLayoutEffect` runs synchronously right after the DOM is updated,
   * before the browser paints anything. So the `gsap.from()` hidden state
   * is already in place for the very first frame the Loader-free page is
   * shown — there's nothing left to flash.
   */
  useLayoutEffect(() => {
    if (!isLoaded || !ref.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hh-eyebrow", { y: 14, opacity: 0, duration: 0.6 })
        .from(".hh-line", { y: 60, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.3")
        .from(".hh-sub", { y: 18, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hh-cta", { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45");
    }, ref);

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    // `isolate` pins down a stacking context on this element itself, so
    // any negative-z-index children (grid-bg) are guaranteed to stack
    // below the rest of this component's content and never escape past
    // it up to <body> — see AmbientEqualizerField.tsx for the full story
    // on why that used to make the equalizer vanish after a couple of
    // seconds on every reload.
    <div
      ref={ref}
      className="relative isolate mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 md:grid-cols-12 md:items-center"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-40" aria-hidden />
      {/* Subtle, continuously "filling" equalizer field along the bottom —
          decorative texture matching the site's audio-engineering theme,
          intentionally muted so it never competes with the hero text. As
          the first non-absolute-background child in normal paint order,
          it renders below everything that follows it without needing a
          z-index of its own. */}
      <AmbientEqualizerField />

      <div className="md:col-span-1">
        <p className="hh-eyebrow text-[11px] uppercase tracking-[0.25em] text-muted [writing-mode:vertical-lr] md:rotate-180">
          {t.hero.eyebrow}
        </p>
      </div>

      <div className="md:col-span-8">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-blink" aria-hidden />
          <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
            {t.hero.status}
          </span>
        </div>

        <h1 className="mt-5 font-display leading-[0.95] tracking-[-0.03em] text-ink">
          <span className="hh-line block text-[clamp(2rem,5.5vw,3.75rem)]">{t.hero.line1}</span>
          <span className="hh-line block text-[clamp(2rem,5.5vw,3.75rem)]">{t.hero.line2}</span>
          <span className="hh-line block text-[clamp(2.5rem,7.5vw,5.25rem)] text-accent italic">
            {t.hero.line3}
          </span>
        </h1>

        <p className="hh-sub mt-6 max-w-[440px] text-[14px] leading-[1.7] tracking-[0.01em] text-muted md:text-[15px]">
          {t.hero.subheadline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <div className="hh-cta">
            <Magnetic strength={0.2}>
              <Link
                href="/contact"
                data-cursor
                className="inline-flex h-[48px] items-center gap-3 rounded-full border border-ink bg-ink px-6 text-[12px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
              >
                {t.hero.ctaPrimary}
              </Link>
            </Magnetic>
          </div>

          <Link
            href="/portfolio"
            data-cursor
            data-cursor-label="play"
            className="hh-cta group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-ink"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors group-hover:border-accent group-hover:text-accent">
              <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" aria-hidden>
                <path d="M0.5 0.5l8 5-8 5V0.5z" />
              </svg>
            </span>
            {t.hero.ctaSecondary}
          </Link>
        </div>
      </div>

      <div className="hidden md:col-span-3 md:block">
        <p className="text-[11px] leading-relaxed tracking-[0.1em] text-muted uppercase">
          {t.hero.trust}
        </p>
      </div>
    </div>
  );
}
