"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 64;
const TRAIL_LENGTH = 140;

type Point = { x: number; y: number };

/**
 * Fills the empty right half of the hero on desktop with something that's
 * meant to genuinely read as a flex, not just decoration:
 *
 * 1. A rotating radial spectrum ring — real per-bar amplitude driven by a
 *    small bank of summed harmonics (not `Math.random()` noise), so it
 *    reads as an actual analyzer reacting to a signal rather than a GIF.
 * 2. A live X/Y oscilloscope trace (a slowly-morphing Lissajous curve —
 *    the harmonic ratio between its two axes drifts over time so it never
 *    repeats the same shape twice) drawn with real phosphor-style
 *    persistence: each frame keeps the last ~140 points and fades them out
 *    rather than clearing instantly, which is what gives it that
 *    glowing-CRT trail rather than a flat plotted line.
 * 3. The whole thing subtly parallax-tilts toward the cursor, and a small
 *    HUD readout (peak / phase / correlation) ticks along in the corner —
 *    same "studio telemetry" language as `StudioHUD`, just applied here.
 *
 * Entirely canvas 2D, zero dependencies. Desktop-only by design (see
 * `HomeHero.tsx`, wrapped in `hidden lg:block`) — the animation loop also
 * bails out on its own whenever the canvas is measured at 0×0 (which is
 * exactly what a `display: none` ancestor collapses it to), so on mobile
 * there's no wasted `requestAnimationFrame` work happening off-screen
 * either, not just a visually hidden element.
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

    const trail: Point[] = [];
    let t = 0;
    let ratio = 3.01; // Lissajous frequency ratio, drifts slowly over time
    let raf = 0;
    let frame = 0;

    const hexToRgb = (hex: string) => {
      const clean = hex.replace("#", "");
      const n = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (width < 4 || height < 4) return; // hidden (mobile) — do nothing

      frame++;
      t += 0.016;
      ratio = 3 + Math.sin(t * 0.045) * 0.6; // slowly morphs the curve's shape

      tilt.x += (tiltTarget.x - tilt.x) * 0.05;
      tilt.y += (tiltTarget.y - tilt.y) * 0.05;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + tilt.x * 10;
      const cy = height / 2 + tilt.y * 8;
      const accent = hexToRgb(colors.accent);
      const ink = hexToRgb(colors.ink);

      // --- faint graticule, like an oscilloscope's screen grid ---
      ctx.strokeStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.05)`;
      ctx.lineWidth = 1;
      const gridStep = Math.max(36, Math.min(width, height) / 12);
      for (let x = cx % gridStep; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = cy % gridStep; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- rotating radial spectrum ring ---
      const ringRadius = Math.min(width, height) * 0.32;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.12);
      for (let i = 0; i < BAR_COUNT; i++) {
        const a = (i / BAR_COUNT) * Math.PI * 2;
        // Sum of a few harmonics per bar so it reads as an actual signal,
        // not a random flicker.
        const amp =
          0.22 +
          0.18 * Math.abs(Math.sin(t * 0.9 + i * 0.35)) +
          0.14 * Math.abs(Math.sin(t * 2.3 + i * 0.12)) +
          0.1 * Math.abs(Math.sin(i * 1.7));
        const len = ringRadius * 0.22 * (0.5 + amp);
        const x1 = Math.cos(a) * ringRadius;
        const y1 = Math.sin(a) * ringRadius * 0.55; // squashed for the tilt/perspective feel
        const x2 = Math.cos(a) * (ringRadius + len);
        const y2 = Math.sin(a) * (ringRadius + len) * 0.55;
        const alpha = 0.1 + amp * 0.5;
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // --- Lissajous oscilloscope trace with phosphor persistence ---
      const scopeR = Math.min(width, height) * 0.17;
      const px = cx + Math.sin(t * ratio) * scopeR;
      const py = cy + Math.sin(t * 1.0 + Math.PI / 2.3) * scopeR * 0.9;
      trail.push({ x: px, y: py });
      if (trail.length > TRAIL_LENGTH) trail.shift();

      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];
        const age = i / trail.length; // 0 = oldest, 1 = newest
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${age * 0.85})`;
        ctx.lineWidth = 1 + age * 1.6;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      // Glowing head of the trace
      ctx.save();
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.9)`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.95)`;
      ctx.beginPath();
      ctx.arc(px, py, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Center reference dot
      ctx.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.18)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();

      // HUD readout, updated a few times a second rather than every frame
      if (hudRef.current && frame % 6 === 0) {
        const peak = (-6 - Math.abs(Math.sin(t * 0.7)) * 8).toFixed(1);
        const phase = Math.round(((t * ratio * 57.3) % 360 + 360) % 360);
        const corr = (Math.sin(t * 0.31) * 0.5 + 0.5).toFixed(2);
        hudRef.current.textContent = `peak ${peak}db · phase ${phase}° · corr ${corr}`;
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
