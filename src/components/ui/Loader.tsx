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
 * Loading screen.
 *
 * FIX (this pass): previously the spectrum ring/flash lived only inside
 * this fully self-contained overlay — once `AppShell` stopped rendering
 * `<Loader/>` (on `isLoaded`), the ring simply vanished along with
 * everything else. It had no relationship to any real element of the
 * site's UI, so the loading→site handoff read as "turn off the loading
 * screen", not "the loading screen becomes part of the site".
 *
 * Now, right before the exit sequence starts, the loader looks up the
 * `[data-signal-dot]` element that lives permanently in the Header (next
 * to the logo — see Header.tsx) and animates the ring's center + the
 * flash pulse toward its real on-screen position, then the iris reveal
 * collapses into that same point instead of a fixed spot near the
 * screen's vertical center. The ring visually "lands" on the dot, which
 * is already sitting there in the DOM (just hidden under this overlay),
 * so when the overlay clips away the accent dot is already exactly where
 * the ring just was — it reads as one continuous element handing off to
 * another, not a shutdown.
 *
 * If `[data-signal-dot]` isn't found for some reason (e.g. this component
 * gets reused somewhere without a Header), everything falls back to the
 * original fixed anchor near the screen's vertical center.
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

  // Movable center for the canvas ring — starts at the old fixed spot,
  // animated toward the header's signal dot right before exit.
  const centerRef = useRef({ x: 0, y: 0 });
  // Same point expressed as viewport percentages, used for the flash
  // pulse (DOM element, positioned in %) and the iris clip-path origin.
  const anchorPctRef = useRef({ x: 50, y: 50 });

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

    const setDefaultCenter = () => {
      const y = height / 2 - Math.min(height * 0.06, 48);
      centerRef.current = { x: width / 2, y };
      anchorPctRef.current = {
        x: 50,
        y: (y / height) * 100,
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      setDefaultCenter();
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
      const { x: cx, y: cy } = centerRef.current;
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

  // --- main timeline: counter/progress → home to signal dot → flash → fade → iris reveal ---
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
      // Locate the header's persistent signal dot and glide the ring's
      // center + the anchor point (used by the flash and the iris below)
      // toward its real on-screen position. It's already in the DOM at
      // this point — just hidden under this overlay — so this is the
      // moment the ring "finds" the thing it's about to hand off to.
      .add(() => {
        const anchor = document.querySelector<HTMLElement>("[data-signal-dot]");
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        gsap.to(centerRef.current, {
          x: targetX,
          y: targetY,
          duration: 0.55,
          ease: "power3.inOut",
        });
        gsap.to(anchorPctRef.current, {
          x: (targetX / window.innerWidth) * 100,
          y: (targetY / window.innerHeight) * 100,
          duration: 0.55,
          ease: "power3.inOut",
          onUpdate: () => {
            if (flashRef.current) {
              flashRef.current.style.left = `${anchorPctRef.current.x}%`;
              flashRef.current.style.top = `${anchorPctRef.current.y}%`;
            }
          },
        });
      })
      // A quick, bright pulse right as loading hits 100% — the "signal
      // locked" moment — now shrinking down toward the dot's size as it
      // travels, so it reads as converging into the dot rather than just
      // flashing in place.
      .to(flashRef.current, { opacity: 0.9, scale: 0.35, duration: 0.55, ease: "power2.out" }, "<")
      .to(flashRef.current, { opacity: 0, scale: 0.15, duration: 0.35, ease: "power2.out" })
      // Fade the copy out *before* the iris starts growing, so nothing
      // gets abruptly clipped mid-wipe.
      .to(contentRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, "-=0.35")
      // Iris reveal: the visible circle of the overlay shrinks from full
      // screen coverage down to a vanishing point — now at the signal
      // dot's real position rather than a fixed spot — like a CRT tube
      // powering off, in reverse, aimed at exactly where the accent dot
      // is waiting.
      .to(iris, {
        radius: 0,
        duration: 0.85,
        ease: "power4.inOut",
        onUpdate: () => {
          if (overlayRef.current) {
            const { x, y } = anchorPctRef.current;
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
      style={{ clipPath: "circle(150% at 50% calc(50% - 3rem))" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Flash pulse at the moment loading completes — positioned via
          left/top (in viewport %) so it can be animated toward the header
          signal dot's real position; translate(-50%, -50%) keeps it
          centered on that point regardless of where it currently sits. */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute h-[36vmin] w-[36vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          left: "50%",
          top: "calc(50% - 3rem)",
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
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
