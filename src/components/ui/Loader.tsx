"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp, useLocale } from "@/context/LocaleContext";

const BAR_COUNT = 72;

const STAGE_LABELS: Record<"ru" | "en", string[]> = {
  ru: ["калибровка входа", "прогрев преампов", "синхронизация", "финальная проверка"],
  en: ["calibrating input", "warming up preamps", "locking sync", "final check"],
};

/**
 * Loading screen, take two.
 *
 * The old version was a flat progress bar + counter — functional, but
 * nothing that would make anyone stop and look. This keeps the same
 * brand/wordmark beat (so it doesn't feel disconnected from the rest of
 * the site) and adds:
 *
 * - A real canvas visual behind the copy: a radial "spectrum ring" whose
 *   amplitude is literally driven by the loading progress (0→100), not a
 *   random flicker — it visibly "wakes up" and brightens as loading
 *   completes, then flashes once at 100%.
 * - Staged flavor-text under the counter ("calibrating input" → "warming
 *   up preamps" → "locking sync" → "final check") instead of a static
 *   "loading" label — small detail, but it's the kind of thing that reads
 *   as "someone actually designed this" rather than a stock loader.
 * - The exit is an iris reveal (`clip-path: circle()` growing from the
 *   center) instead of the old slide-up-and-fade. Deliberately
 *   `clip-path`, not `transform`/`scale` — a `transform` left lingering
 *   on an ancestor of the real page would make it the containing block
 *   for any `position: fixed` descendant (breaks things like the contact
 *   page's modal — see PageTransition.tsx for the full story on that
 *   class of bug). `clip-path` doesn't have that side effect, so it's
 *   safe to animate on the whole overlay.
 */
export function Loader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressPercentRef = useRef(0);
  const { setLoaded } = useApp();
  const { locale } = useLocale();

  // --- canvas: rotating spectrum ring, amplitude tied to real progress ---
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
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t = 0;
    const hex = { r: 196, g: 30, b: 58 }; // matches --accent (#c41e3a)

    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const progress = progressPercentRef.current / 100;
      const cx = width / 2;
      const cy = height / 2 - Math.min(height * 0.06, 48);
      const baseRadius = Math.min(width, height) * (0.12 + progress * 0.06);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.35);
      for (let i = 0; i < BAR_COUNT; i++) {
        const a = (i / BAR_COUNT) * Math.PI * 2;
        const amp =
          0.15 +
          0.5 * progress +
          0.25 * Math.abs(Math.sin(t * 1.6 + i * 0.4)) * progress;
        const len = baseRadius * 0.5 * amp;
        const x1 = Math.cos(a) * baseRadius;
        const y1 = Math.sin(a) * baseRadius;
        const x2 = Math.cos(a) * (baseRadius + len);
        const y2 = Math.sin(a) * (baseRadius + len);
        ctx.strokeStyle = `rgba(${hex.r}, ${hex.g}, ${hex.b}, ${0.12 + amp * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --- main timeline: counter/progress → flash → fade copy → iris reveal ---
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const stages = STAGE_LABELS[locale] ?? STAGE_LABELS.en;
    const counter = { val: 0 };
    // Starts matching the element's actual on-mount inline clip-path
    // (`circle(150% ...)`, fully covering the screen) so the tween has no
    // jump to make before it visibly starts shrinking toward 0 (vanished).
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
      // A quick, bright pulse right as loading hits 100% — the "signal
      // locked" moment.
      .to(flashRef.current, { opacity: 0.9, scale: 1.15, duration: 0.18, ease: "power1.out" })
      .to(flashRef.current, { opacity: 0, scale: 1.4, duration: 0.5, ease: "power2.out" })
      // Fade the copy out *before* the iris starts growing, so nothing
      // gets abruptly clipped mid-wipe.
      .to(contentRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, "-=0.35")
      // Iris reveal: the visible circle of the overlay shrinks from full
      // screen coverage down to a vanishing point at the exact spot the
      // ring/flash just lit up — like a CRT tube powering off, just in
      // reverse (site "grows in" from the edges toward that point instead
      // of the picture collapsing away).
      .to(iris, {
        radius: 0,
        duration: 0.85,
        ease: "power4.inOut",
        onUpdate: () => {
          if (overlayRef.current) {
            overlayRef.current.style.clipPath = `circle(${iris.radius}% at 50% calc(50% - 3rem))`;
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
      style={{ clipPath: "circle(150% at 50% calc(50% - 3rem))" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Flash pulse at the moment loading completes */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[36vmin] w-[36vmin] -translate-x-1/2 -translate-y-[calc(50%+3rem)] rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
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
