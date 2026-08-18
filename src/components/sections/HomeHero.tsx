"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useLocale, useApp } from "@/context/LocaleContext";
import { Magnetic } from "@/components/ui/Magnetic";
import { AmbientEqualizerField } from "@/components/effects/AmbientEqualizerField";

// Every group of elements the entrance timeline animates, with how far
// (in px) they start offset before settling into place.
const ENTRANCE_GROUPS: { selector: string; y: number }[] = [
  { selector: ".hh-eyebrow", y: 14 },
  { selector: ".hh-line", y: 60 },
  { selector: ".hh-sub", y: 18 },
  { selector: ".hh-cta", y: 16 },
];

export function HomeHero() {
  const { t } = useLocale();
  const { isLoaded } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  /*
   * REAL ROOT CAUSE of "text shows, disappears, then animates in":
   *
   * The previous fix (switching this effect from `useEffect` to
   * `useLayoutEffect`) addressed a *timing* concern, but the actual bug
   * lives one level up, in how the Loader reveals the page. Loader.tsx's
   * exit isn't a hard cut — its overlay's `clip-path` shrinks from a huge
   * circle down to nothing over ~0.85s, progressively uncovering whatever
   * is underneath *while that's still happening*. `isLoaded` only flips
   * to true in that timeline's `onComplete`, i.e. only once the circle
   * has already fully closed.
   *
   * So as long as this component only hid itself once `isLoaded` became
   * true, it spent that entire 0.85s reveal sitting in its plain, fully
   * visible, unanimated state — which is exactly what the shrinking
   * circle was uncovering. Only after the reveal finished did
   * `isLoaded` flip, at which point `gsap.from()` would snap everything
   * back to hidden and replay the entrance — reading as "text appears
   * (through the closing iris), disappears (gsap.from() resets it),
   * then animates in for real".
   *
   * FIX: don't wait for `isLoaded` to hide anything. A separate effect
   * below puts every entrance target into its hidden/offset state
   * immediately on mount (before first paint, via `useLayoutEffect`,
   * completely independent of `isLoaded`) — so by the time the Loader's
   * iris starts revealing the page at all, there's nothing but empty
   * space to reveal. Only the actual entrance tween (still gated on
   * `isLoaded`, still a `useLayoutEffect`) makes any of this text
   * visible for the first time, and it does so with `.to()` rather than
   * `.from()` — continuing on from the already-hidden state instead of
   * re-establishing it, so there's no extra "snap to hidden" step left
   * to look like a second appearance.
   */
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      ENTRANCE_GROUPS.forEach(({ selector, y }) => {
        gsap.set(selector, { y, opacity: 0 });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!isLoaded || !ref.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hh-eyebrow", { y: 0, opacity: 1, duration: 0.6 })
        .to(".hh-line", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, "-=0.3")
        .to(".hh-sub", { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .to(".hh-cta", { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.45");
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
