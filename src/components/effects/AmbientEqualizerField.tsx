"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BAR_COUNT = 56;

type AmbientEqualizerFieldProps = {
  className?: string;
};

/**
 * Very low-opacity ambient backdrop: a wide field of thin bars that
 * slowly and continuously "fill" up and down, like a spectrum analyzer
 * idling in the background of a studio. Purely decorative (aria-hidden,
 * pointer-events-none, no dependency on the real player).
 *
 * Bug fix: this used to sit at `-z-10`. A negative z-index only stacks
 * "below" other content within the *nearest ancestor that establishes a
 * stacking context*. `HomeHero`/`PortfolioBackdrop`'s wrapper is just
 * `position: relative` with no z-index/opacity/transform of its own, so
 * it doesn't create one — meaning the negative z-index escaped all the
 * way up past `<main>` to `<body>`, and ended up rendered *behind the
 * page's own opaque background color*. That's why it only ever flashed
 * briefly right after the loader (whose own boxes still happened to be
 * transparent at that exact moment) before disappearing for good on every
 * reload. Removing the negative z-index — and instead relying on normal
 * DOM/paint order, since this is always the first child of its section —
 * keeps it reliably visible without needing every parent to also opt into
 * `isolate`.
 */
export function AmbientEqualizerField({ className = "" }: AmbientEqualizerFieldProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canAnimate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        // Floor raised from ~0.08 to 0.22 — at the old floor combined with
        // the field's low opacity, bars would occasionally tween down to a
        // height so small it read as "not working" even though the
        // animation was, technically, still running.
        const base = 0.22 + Math.abs(Math.sin(i * 12.9898)) * 0.5;

        if (!canAnimate) {
          gsap.set(bar, { scaleY: base });
          return;
        }

        gsap.set(bar, { scaleY: base });
        gsap.to(bar, {
          scaleY: () => 0.2 + Math.random() * 0.75,
          duration: () => 3.5 + Math.random() * 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.035,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      // Fixed via vh/clamp rather than a % height: this field is used
      // inside containers whose own height is intrinsic/auto (e.g. the
      // home hero grid), and percentage heights resolve to 0 against an
      // auto-height parent — which made the bars silently collapse right
      // after layout settled. vh is always resolvable against the
      // viewport, so it stays visible regardless of the parent's sizing.
      //
      // No z-index here at all (see note above) — being the first child
      // of a `relative` section is enough to keep it behind later
      // siblings in normal paint order.
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-[2px] opacity-[0.09] ${className}`}
      style={{ height: "clamp(90px, 20vh, 220px)" }}
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="w-full origin-bottom rounded-t-sm bg-ink"
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}
