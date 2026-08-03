"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// Slowed down from the first pass (was 0.7s / 0.25s) — the quick version
// read as abrupt. The curtain now takes noticeably longer to open, and
// the sweep line and content underneath are timed to match.
const CURTAIN_DURATION = 1.4; // seconds
const CURTAIN_FADE_DELAY = 0.55; // seconds, once clip-path is mostly open
const SWEEP_DURATION = 1.4; // seconds

/**
 * Wraps every public page.
 *
 * PREVIOUS APPROACH (removed): animated `opacity`/`clip-path` directly on
 * the routed page's own wrapper via framer-motion's `initial`/`animate`.
 * That looked fine in isolation, but in the App Router the actual sequence
 * on navigation is: Next fetches the new route's RSC payload → commits it
 * to the DOM (the new page is now fully, visibly painted) → *then*
 * framer-motion's effects run and apply the `initial` clip-path. Between
 * those two steps the browser can — and did — paint a frame of the new
 * page fully revealed, un-clipped. That's the "page pops in, then the
 * animation plays, then it pops in again" flash: the page was genuinely
 * appearing twice.
 *
 * FIX: don't animate the page at all. Instead, an independent "curtain" —
 * a sibling overlay, not a wrapper — sits on top of everything. On every
 * pathname change, `useLayoutEffect` (which runs synchronously *before*
 * the browser paints, unlike a regular effect) snaps the curtain fully
 * shut first, forces a reflow, and only then starts animating it open.
 * Because this doesn't care when React/Next actually finished mounting
 * the new page underneath — the curtain's own paint timing is what the
 * viewer sees — there's no window left for an unclipped frame to sneak
 * through, regardless of how fast or slow the route transition itself is.
 *
 * The curtain only ever animates `clip-path`/`opacity`, never `transform`,
 * for the same reason as before: a stray inline `transform` left on an
 * ancestor of the routed page would become the containing block for any
 * `position: fixed` descendant inside it (e.g. the contact page's
 * BPM/key-analyzer modal), silently breaking its positioning. Since the
 * curtain is a sibling — not a wrapper around `children` — this concern
 * doesn't even apply to it, but the discipline is kept anyway.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const curtainRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Don't play the transition on the very first paint of the site —
    // the Loader already owns that moment.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const curtain = curtainRef.current;
    const sweep = sweepRef.current;
    if (!curtain) return;

    // 1) Snap shut instantly, no transition — this happens before the
    //    browser's next paint, so nothing is ever seen "open" at this point.
    curtain.style.transition = "none";
    curtain.style.clipPath = "circle(150% at 50% 0%)";
    curtain.style.opacity = "1";
    // Force a style flush/reflow so the browser can't coalesce the "shut"
    // state and the "open" tween into a single paint.
    void curtain.offsetHeight;

    // 2) Now animate open, revealing whatever page is already sitting
    //    underneath (fully mounted or not — it no longer matters).
    curtain.style.transition = `clip-path ${CURTAIN_DURATION}s ${EASE}, opacity 0.4s ease-out ${CURTAIN_FADE_DELAY}s`;
    curtain.style.clipPath = "circle(2% at 50% 0%)";
    curtain.style.opacity = "0";

    // Decorative scanline sweep, matching the old effect — timed to the
    // same, slower duration as the curtain itself.
    if (sweep) {
      sweep.style.transition = "none";
      sweep.style.transform = "translateY(0)";
      sweep.style.opacity = "0";
      void sweep.offsetHeight;
      sweep.style.transition = `transform ${SWEEP_DURATION}s ${EASE}, opacity ${SWEEP_DURATION}s ${EASE}`;
      sweep.style.transform = "translateY(100vh)";
      sweep.style.opacity = "0.7";
    }
  }, [pathname]);

  return (
    <div className="relative">
      {children}

      {/* Curtain — a plain sibling of the routed page, not a wrapper
          around it. Starts fully open (invisible) so it doesn't affect
          the very first paint of the site; every navigation after that
          snaps it shut then re-opens it via the effect above. */}
      <div
        ref={curtainRef}
        className="pointer-events-none fixed inset-0 z-[85] bg-paper"
        style={{ clipPath: "circle(150% at 50% 0%)", opacity: 0 }}
        aria-hidden
      />

      {/* Decorative scanline sweep on top of the curtain. */}
      <div
        ref={sweepRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-[86] h-[2px] opacity-0"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 16px 2px var(--accent)",
        }}
        aria-hidden
      />
    </div>
  );
}
