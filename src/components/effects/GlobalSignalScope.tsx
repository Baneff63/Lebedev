"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useApp } from "@/context/LocaleContext";
import { createSignalScopeAnimator } from "@/lib/signalScopeAnimator";
import { registerSignalScopeHandoff } from "@/lib/signalScopeHandoff";

/** Any page that wants to host the scope renders an empty marker element
 * carrying this attribute wherever the scope should sit on that page —
 * see SignalScope.tsx. */
export const SIGNAL_SCOPE_SLOT_ATTR = "data-signal-scope-slot";
const SLOT_SELECTOR = `[${SIGNAL_SCOPE_SLOT_ATTR}]`;

type Rect = { left: number; top: number; width: number; height: number };

function measureSlot(): Rect | null {
  const slot = document.querySelector<HTMLElement>(SLOT_SELECTOR);
  if (!slot) return null;
  const box = slot.getBoundingClientRect();
  // Important: the slot can exist in the DOM but be `display: none` on
  // this viewport (e.g. the home hero and portfolio slots are both
  // `hidden lg:block`, mobile-first). A hidden element still matches
  // `querySelector` — it just has a 0×0 box — so it has to be treated
  // exactly like "no slot at all", not left showing at a stale position.
  if (box.width < 4 || box.height < 4) return null;
  return { left: box.left, top: box.top, width: box.width, height: box.height };
}

/**
 * A single, persistent canvas that draws the "signal scope" visual (see
 * signalScopeAnimator.ts) and smoothly flies between pages instead of
 * being torn down and recreated on every navigation.
 *
 * Previously the scope was a self-contained component rendered directly
 * inside the home page, so it simply ceased to exist the moment you
 * navigated away. This component is mounted exactly once, at the
 * app-shell level (see Providers.tsx), so it survives client-side route
 * changes. On every pathname change it looks up whatever element on the
 * NEW page carries `data-signal-scope-slot`, and tweens its own floating
 * rectangle from wherever it currently sits toward that element's actual
 * on-screen box. Because the underlying drawing always reads from the one
 * shared simulation clock (signalScopeAnimator.ts), the shape itself
 * never resets mid-flight — it's the same continuous animation, just
 * relocating.
 *
 * Stays hidden and does no positioning work until the initial Loader
 * sequence has finished (`isLoaded`) — the Loader owns that first reveal
 * and hands off directly into the home page's slot on its own (see
 * Loader.tsx); this component picks up from exactly there for every
 * navigation afterward, snapping to that slot with no travel the very
 * first time (nothing to fly from yet), then flying for every subsequent
 * navigation.
 *
 * If the destination page has no slot (or its slot is currently hidden,
 * e.g. below the `lg` breakpoint), it fades out rather than sitting
 * somewhere stale; if a later page/viewport has one again, it fades back
 * in at the new spot instead of visibly crossing the screen from an
 * unrelated previous location.
 */
export function GlobalSignalScope() {
  const pathname = usePathname();
  const { isLoaded } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const rectRef = useRef<Rect>({ left: 0, top: 0, width: 0, height: 0 });
  const hasRectRef = useRef(false);
  const visibleRef = useRef(false);

  // --- drawing loop: reads whatever rectRef.current currently is ------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = { accent: "#c41e3a", ink: "#141210" };
    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors.accent = style.getPropertyValue("--accent").trim() || colors.accent;
      colors.ink = style.getPropertyValue("--ink").trim() || colors.ink;
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const animator = createSignalScopeAnimator();
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visibleRef.current) return;

      const rect = rectRef.current;
      if (rect.width < 4 || rect.height < 4) return;

      const hud = animator.tick(ctx, rect.width, rect.height, {
        colors,
        intensity: 1,
        dpr,
        offsetX: rect.left,
        offsetY: rect.top,
      });

      const hudEl = hudRef.current;
      if (hudEl) {
        hudEl.style.transform = `translate(${rect.left + rect.width / 2}px, ${
          rect.top + rect.height - 20
        }px) translateX(-50%)`;
        if (hud) hudEl.textContent = hud;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      themeObserver.disconnect();
    };
  }, []);

// Loader зовёт это через triggerSignalScopeHandoff в момент, когда он
// уже знает реальный hero-rect — то есть ДО того как его iris начнёт
// открываться. Это позволяет этому канвасу быть уже полностью на месте
// (rect + opacity) в момент, когда клип-path лоадера начинает его
// раскрывать — раскрывается уже идентичная картинка (общий sim-clock),
// поэтому визуально нечему "проявляться" или "исчезать".
useEffect(() => {
  return registerSignalScopeHandoff((rect) => {
    if (hasRectRef.current) return; // важен только самый первый handoff
    const root = rootRef.current;
    if (!root) return;
    rectRef.current = rect;
    hasRectRef.current = true;
    visibleRef.current = true;
    // Снап, а не твин — в этот момент мы всё ещё под непрозрачным
    // оверлеем Loader'а, смотреть тут пока не на что.
    gsap.set(root, { opacity: 1 });
  });
}, []);


  // --- keep it aligned with its slot across viewport/breakpoint changes,
  //     without the "fly" animation (a resize isn't a navigation) -------
  useEffect(() => {
    const onResize = () => {
      const root = rootRef.current;
      if (!root || !hasRectRef.current) return;

      const target = measureSlot();

      if (!target) {
        if (visibleRef.current) {
          visibleRef.current = false;
          gsap.to(root, { opacity: 0, duration: 0.3, ease: "power2.out" });
        }
        return;
      }

      gsap.killTweensOf(rectRef.current);
      rectRef.current = target;

      if (!visibleRef.current) {
        visibleRef.current = true;
        gsap.to(root, { opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- follow the route: measure the new page's slot, fly there ------
  useLayoutEffect(() => {
    if (!isLoaded) return;
    const root = rootRef.current;
    if (!root) return;

    const target = measureSlot();

    if (!target) {
      if (hasRectRef.current) {
        gsap.to(root, { opacity: 0, duration: 0.4, ease: "power2.out" });
      }
      visibleRef.current = false;
      return;
    }

    if (!hasRectRef.current) {
      // Very first appearance (right after the Loader hands off) — snap
      // straight there, there's nothing to fly from yet.
      rectRef.current = target;
      hasRectRef.current = true;
      visibleRef.current = true;
      gsap.set(root, { opacity: 1 });
      return;
    }

    visibleRef.current = true;
    gsap.to(root, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.killTweensOf(rectRef.current);
    gsap.to(rectRef.current, {
      ...target,
      duration: 0.9,
      ease: "power3.inOut",
    });
    // Only the route (and the initial isLoaded flip) should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isLoaded]);

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 -z-10 opacity-0" aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        ref={hudRef}
        className="pointer-events-none absolute top-0 left-0 whitespace-nowrap text-[10px] tracking-[0.16em] text-muted/50 uppercase tabular-nums"
      />
    </div>
  );
}
