"use client";

import { useEffect, useRef } from "react";
import { createSignalScopeAnimator } from "@/lib/signalScopeAnimator";

/**
 * Fills the empty right half of the hero on desktop with something that's
 * meant to genuinely read as a flex, not just decoration — see
 * `src/lib/signalScopeAnimator.ts` for the actual drawing routine (radial
 * spectrum ring + Lissajous trace + HUD readout). That routine is shared
 * with `Loader.tsx`: the loading screen draws literally the same visual,
 * ramped up from 0 intensity, positioned over this exact element (found
 * via the `data-hero-signal-scope` attribute below) — so the loader can
 * convincingly hand off into this component once loading finishes, rather
 * than a differently-styled loading animation just disappearing.
 *
 * On top of the shared canvas drawing, this component still owns:
 * - theme-aware colors (re-read on `data-theme` changes),
 * - measuring its own box via ResizeObserver (so it puts the identical
 *   drawing logic to real, honest use of whatever space it's given),
 * - a subtle cursor-driven parallax tilt,
 * - the small HUD readout text in the corner.
 *
 * Entirely canvas 2D, zero dependencies beyond the shared animator.
 * Desktop-only by design (see `HomeHero.tsx`, wrapped in `hidden lg:block`)
 * — the animation loop also bails out on its own whenever the canvas is
 * measured at 0×0 (exactly what a `display: none` ancestor collapses it
 * to), so there's no wasted `requestAnimationFrame` work on mobile either.
 */
export function SignalScope({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const colors = { accent: "#c41e3a", ink: "#141210" };
    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors.accent = style.getPropertyValue("--accent").trim() || colors.accent;
      colors.ink = style.getPropertyValue("--ink").trim() || colors.ink;
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      width = rect?.width ?? 0;
      height = rect?.height ?? 0;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });
    ro.observe(container);

    const tilt = { x: 0, y: 0 };
    const tiltTarget = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      tiltTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      tiltTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      tiltTarget.x = 0;
      tiltTarget.y = 0;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const animator = createSignalScopeAnimator();
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (width < 4 || height < 4) return; // hidden (mobile) — do nothing

      tilt.x += (tiltTarget.x - tilt.x) * 0.05;
      tilt.y += (tiltTarget.y - tilt.y) * 0.05;

      const hud = animator.tick(ctx, width, height, {
        tiltX: tilt.x,
        tiltY: tilt.y,
        colors,
        intensity: 1,
        dpr,
      });

      if (hud && hudRef.current) {
        hudRef.current.textContent = hud;
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-hero-signal-scope
      className={`pointer-events-auto relative h-full w-full ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        ref={hudRef}
        className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.16em] text-muted/50 uppercase tabular-nums"
      />
    </div>
  );
}
