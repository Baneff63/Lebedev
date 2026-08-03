"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp, useLocale } from "@/context/LocaleContext";
import { createSignalScopeAnimator } from "@/lib/signalScopeAnimator";

const STAGE_LABELS: Record<"ru" | "en", string[]> = {
  ru: ["калибровка входа", "прогрев преампов", "синхронизация", "финальная проверка"],
  en: ["calibrating input", "warming up preamps", "locking sync", "final check"],
};

type Rect = { left: number; top: number; width: number; height: number };

/**
 * Loading screen.
 *
 * The canvas visual is no longer a bespoke "ring" that only ever lived on
 * this overlay — it's the exact same drawing routine as the homepage
 * hero's `SignalScope` (`src/lib/signalScopeAnimator.ts`): the radial
 * spectrum ring + Lissajous scribble + HUD readout. Its intensity ramps
 * from 0 to 1 as loading progresses, so it visibly "wakes up" in step
 * with the counter, arriving at full strength exactly as loading
 * completes — which is also the moment it should look identical to the
 * real thing.
 *
 * HANDOFF, two cases:
 *
 * 1. Landing on the homepage on a wide-enough viewport: the real
 *    `SignalScope` (marked with `data-hero-signal-scope`) is already
 *    mounted underneath this overlay, quietly animating. Right before
 *    exit, the Loader measures that element's actual on-screen rect and
 *    redraws its own scope inside that exact rectangle (same size,
 *    same position). The final iris-reveal then collapses precisely
 *    around that rect's center, so what's revealed underneath is —
 *    visually — the same shape, in the same place, already moving. It
 *    reads as "the loading visual becomes the hero element", not two
 *    unrelated things swapping.
 *
 * 2. Anywhere else (other routes, or no room for the hero's right-hand
 *    column): there's no real element to hand off to, so the Loader
 *    instead collapses into the small persistent signal dot in the
 *    header (`data-signal-dot`, next to the logo) — the same fallback
 *    used previously, now just wrapped around the richer scope visual
 *    instead of a plain ring.
 */
export function Loader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const progressPercentRef = useRef(0);

  // The rectangle (viewport px) the scope is currently drawn inside.
  // Starts as a sensible default covering roughly where the hero's right
  // column would be, and gets swapped for the real element's rect right
  // before exit whenever that element exists.
  const rectRef = useRef<Rect>({ left: 0, top: 0, width: 0, height: 0 });
  // Whether a real `[data-hero-signal-scope]` handoff target was found —
  // decides which exit strategy (rect morph vs. header-dot collapse) runs.
  const heroAnchorFoundRef = useRef(false);
  // Iris collapse origin, in viewport percentages.
  const irisOriginRef = useRef({ x: 50, y: 50 });

  const { setLoaded } = useApp();
  const { locale } = useLocale();

  const setDefaultRect = (width: number, height: number) => {
    // Roughly mirrors where SignalScope actually sits on a wide viewport
    // (`inset-y-6 right-0 w-[36%]`), so even before we can measure the
    // real element (or on routes that don't have it) the loader's scope
    // sits in a plausible, consistent spot rather than dead-center.
    const w = Math.min(width * 0.36, 620);
    const h = Math.min(height * 0.7, 640);
    rectRef.current = {
      width: w,
      height: h,
      left: width - w - Math.max(16, width * 0.02),
      top: height / 2 - h / 2,
    };
  };

  // --- canvas: shared signal-scope visual, intensity tied to progress ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (!heroAnchorFoundRef.current) setDefaultRect(width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = { accent: "#c41e3a", ink: "#141210" };
    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors.accent = style.getPropertyValue("--accent").trim() || colors.accent;
      colors.ink = style.getPropertyValue("--ink").trim() || colors.ink;
    };
    readColors();

    const animator = createSignalScopeAnimator();
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rect = rectRef.current;
      const intensity = Math.min(1, progressPercentRef.current / 100);

      const hud = animator.tick(ctx, rect.width, rect.height, {
        colors,
        intensity,
        dpr,
        offsetX: rect.left,
        offsetY: rect.top,
      });
      if (hud && hudRef.current) hudRef.current.textContent = hud;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --- main timeline: counter/progress → locate handoff target → exit ---
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const stages = STAGE_LABELS[locale] ?? STAGE_LABELS.en;
    const counter = { val: 0 };
    const iris = { radius: 150 };
    let lastStage = -1;

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setLoaded(true);
      },
    });

    tl.to(counter, {
      val: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        progressPercentRef.current = counter.val;
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(counter.val)).padStart(2, "0");
        }
        const stageIndex = Math.min(stages.length - 1, Math.floor((counter.val / 100) * stages.length));
        if (stageIndex !== lastStage && stageRef.current) {
          lastStage = stageIndex;
          stageRef.current.textContent = stages[stageIndex];
        }
      },
    })
      .to(progressRef.current, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0)
      // Look for the real hero element to hand off to. If it exists,
      // glide the scope's drawing rect from wherever it currently is
      // toward that element's exact on-screen box — so by the time the
      // iris opens, the loader's scope and the real one line up exactly.
      .add(() => {
        const heroEl = document.querySelector<HTMLElement>("[data-hero-signal-scope]");
        const from = { ...rectRef.current };

        if (heroEl) {
          const box = heroEl.getBoundingClientRect();
          if (box.width > 4 && box.height > 4) {
            heroAnchorFoundRef.current = true;
            const to = { left: box.left, top: box.top, width: box.width, height: box.height };
            gsap.to(from, {
              ...to,
              duration: 0.6,
              ease: "power3.inOut",
              onUpdate: () => {
                rectRef.current = { ...from };
              },
            });
            irisOriginRef.current = {
              x: ((box.left + box.width / 2) / window.innerWidth) * 100,
              y: ((box.top + box.height / 2) / window.innerHeight) * 100,
            };
            return;
          }
        }

        // Fallback: no real hero element on this route/viewport — collapse
        // the whole scope down toward the header's small signal dot
        // instead, shrinking the rect itself so the visual reads as
        // condensing into that point rather than a mismatched swap.
        const dot = document.querySelector<HTMLElement>("[data-signal-dot]");
        const dotRect = dot?.getBoundingClientRect();
        const target = dotRect
          ? { left: dotRect.left, top: dotRect.top, width: dotRect.width, height: dotRect.height }
          : { left: from.left + from.width / 2, top: from.top + from.height / 2, width: 2, height: 2 };

        gsap.to(from, {
          ...target,
          duration: 0.6,
          ease: "power3.inOut",
          onUpdate: () => {
            rectRef.current = { ...from };
          },
        });
        irisOriginRef.current = {
          x: ((target.left + target.width / 2) / window.innerWidth) * 100,
          y: ((target.top + target.height / 2) / window.innerHeight) * 100,
        };
      })
      // Fade the copy (counter / progress bar / stage label) out before
      // the iris starts opening, so nothing gets abruptly clipped mid-wipe.
      .to(contentRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, "-=0.15")
      .to(hudRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, "<")
      // Iris reveal: the visible circle of the overlay shrinks from full
      // screen coverage down to a vanishing point at the handoff target
      // (the real hero scope, or the header dot) — like a CRT tube
      // powering off, in reverse, aimed exactly at what's underneath.
      .to(iris, {
        radius: 0,
        duration: 0.85,
        ease: "power4.inOut",
        onUpdate: () => {
          if (overlayRef.current) {
            const { x, y } = irisOriginRef.current;
            overlayRef.current.style.clipPath = `circle(${iris.radius}% at ${x}% ${y}%)`;
          }
        },
      });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [setLoaded, locale]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex flex-col justify-between overflow-hidden bg-paper px-5 py-8 md:px-10 md:py-10"
      style={{ clipPath: "circle(150% at 50% 50%)" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        ref={hudRef}
        className="pointer-events-none absolute bottom-3 right-[3%] whitespace-nowrap text-[10px] tracking-[0.16em] text-muted/50 uppercase tabular-nums"
      />

      <div ref={contentRef} className="relative flex h-full flex-col justify-between">
        <p className="font-display text-sm tracking-[0.12em] text-ink uppercase">baneoff</p>

        <div className="mx-auto w-full max-w-[1440px]">
          <p className="font-display text-[clamp(2rem,6vw,4rem)] leading-none tracking-[-0.02em] text-ink italic">
            mixing &amp; mastering
          </p>
          <div className="mt-8 h-px w-full bg-ink/10">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-accent"
            />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span
            ref={stageRef}
            className="text-[11px] uppercase tracking-[0.22em] text-muted tabular-nums"
          >
            {(STAGE_LABELS[locale] ?? STAGE_LABELS.en)[0]}
          </span>
          <span
            ref={counterRef}
            className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-none tracking-[-0.04em] text-ink tabular-nums"
          >
            00
          </span>
        </div>
      </div>
    </div>
  );
}
