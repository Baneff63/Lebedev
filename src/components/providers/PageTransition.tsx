"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const CURTAIN_DURATION = 1.4; // seconds
const CURTAIN_FADE_DELAY = 0.55; // seconds, once clip-path is mostly open
const SWEEP_DURATION = 1.4; // seconds

type TransitionVariant = "top" | "corner-tl" | "corner-br" | "center";

/**
 * Per-page transition "flavors". Every variant uses the exact same
 * mechanism as before — a `circle(R% at X% Y%)` clip-path shrinking from
 * fully-covering down to a near-0 point — only the origin point (and the
 * sweep line's axis/direction) changes. Deliberately kept to the same
 * `circle(...)` function for every variant rather than switching to
 * `polygon(...)` shapes: browsers only interpolate clip-path smoothly
 * between two values when they're the same function with matching
 * parameter structure, so varying just the static params here is what
 * keeps every variant reliably smooth rather than risking a snapping/
 * non-interpolated jump on some variant.
 */
const VARIANTS: Record<
  TransitionVariant,
  { origin: string; sweepAxis: "horizontal" | "vertical"; sweepReverse?: boolean }
> = {
  // Home — the original top-center iris.
  top: { origin: "50% 0%", sweepAxis: "horizontal" },
  // Portfolio — opens from the top-left corner.
  "corner-tl": { origin: "0% 0%", sweepAxis: "vertical" },
  // Contact — opens from the bottom-right corner, sweep runs the other way.
  "corner-br": { origin: "100% 100%", sweepAxis: "vertical", sweepReverse: true },
  // Blog / blog posts — opens from dead-center, sweep runs bottom-to-top.
  center: { origin: "50% 50%", sweepAxis: "horizontal", sweepReverse: true },
};

function getVariant(pathname: string): TransitionVariant {
  if (pathname.startsWith("/portfolio")) return "corner-tl";
  if (pathname.startsWith("/contact")) return "corner-br";
  if (pathname.startsWith("/blog")) return "center";
  return "top";
}

/**
 * Wraps every public page.
 *
 * Mechanism (unchanged from before): an independent "curtain" overlay —
 * a sibling of the routed page, not a wrapper around it — sits on top of
 * everything. On every pathname change, `useLayoutEffect` (runs
 * synchronously before the browser paints) snaps the curtain fully shut
 * first, forces a reflow, then animates it open. Because this doesn't
 * depend on when React/Next actually finished mounting the new page
 * underneath, there's no window for an unclipped frame to sneak through.
 *
 * NEW: which corner/point the curtain opens from — and which direction
 * the decorative sweep line travels — now depends on which section is
 * being navigated to (see VARIANTS/getVariant above), so different parts
 * of the site each get their own transition character instead of every
 * navigation looking identical.
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

    const variant = VARIANTS[getVariant(pathname)];

    // 1) Snap shut instantly, no transition — this happens before the
    //    browser's next paint, so nothing is ever seen "open" at this point.
    curtain.style.transition = "none";
    curtain.style.clipPath = `circle(150% at ${variant.origin})`;
    curtain.style.opacity = "1";
    // Force a style flush/reflow so the browser can't coalesce the "shut"
    // state and the "open" tween into a single paint.
    void curtain.offsetHeight;

    // 2) Now animate open, revealing whatever page is already sitting
    //    underneath (fully mounted or not — it no longer matters).
    curtain.style.transition = `clip-path ${CURTAIN_DURATION}s ${EASE}, opacity 0.4s ease-out ${CURTAIN_FADE_DELAY}s`;
    curtain.style.clipPath = `circle(2% at ${variant.origin})`;
    curtain.style.opacity = "0";

    // Decorative scanline sweep — axis/direction follows the variant so
    // it always travels roughly "away from" the curtain's opening point.
    if (sweep) {
      sweep.style.transition = "none";
      sweep.style.top = "auto";
      sweep.style.right = "auto";
      sweep.style.bottom = "auto";
      sweep.style.left = "auto";
      sweep.style.width = "auto";
      sweep.style.height = "auto";

      if (variant.sweepAxis === "horizontal") {
        sweep.style.left = "0";
        sweep.style.right = "0";
        sweep.style.height = "2px";
        if (variant.sweepReverse) {
          sweep.style.bottom = "0";
        } else {
          sweep.style.top = "0";
        }
        sweep.style.transform = "translateY(0)";
      } else {
        sweep.style.top = "0";
        sweep.style.bottom = "0";
        sweep.style.width = "2px";
        if (variant.sweepReverse) {
          sweep.style.right = "0";
        } else {
          sweep.style.left = "0";
        }
        sweep.style.transform = "translateX(0)";
      }

      sweep.style.opacity = "0";
      void sweep.offsetHeight;

      sweep.style.transition = `transform ${SWEEP_DURATION}s ${EASE}, opacity ${SWEEP_DURATION}s ${EASE}`;
      if (variant.sweepAxis === "horizontal") {
        sweep.style.transform = variant.sweepReverse ? "translateY(-100vh)" : "translateY(100vh)";
      } else {
        sweep.style.transform = variant.sweepReverse ? "translateX(-100vw)" : "translateX(100vw)";
      }
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

      {/* Decorative scanline sweep on top of the curtain. Position/size
          are fully controlled imperatively per-variant in the effect
          above, so no positional Tailwind classes are set here. */}
      <div
        ref={sweepRef}
        className="pointer-events-none fixed z-[86] opacity-0"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 16px 2px var(--accent)",
        }}
        aria-hidden
      />
    </div>
  );
}
