// Shared drawing routine behind the "signal scope" visual: a rotating
// radial spectrum ring plus a slowly-morphing Lissajous trace with
// phosphor-style persistence, drawn on a 2D canvas.
//
// This is used in two places: the decorative element on the right side of
// the homepage hero (SignalScope.tsx) and the Loader's own canvas, which
// draws the same visual (ramped up from 0 intensity) as a stand-in for
// the real thing while loading, then hands off into it.
//
// BUG FIX — "the shape in the loader isn't synced with the one in the
// hero": the previous version had each caller create its OWN animator via
// `createSignalScopeAnimator()`, and each instance kept its own private
// `t` (time accumulator), `ratio`, and trail history in its closure. Both
// copies used identical formulas, but nothing tied their actual state
// together — they were two independent simulations that merely looked
// similar. By the time the Loader handed off into the real SignalScope,
// their rotation angle and Lissajous trail had usually drifted out of
// phase with each other (different mount timing, different frame
// scheduling), so the handoff read as a visible "swap" between two
// similar-but-different shapes rather than one continuous shape.
//
// Fix: split "advance the simulation" from "draw the current state to a
// given canvas". There is now exactly ONE simulation clock for the whole
// app (module-level `sim`, driven by its own persistent
// `requestAnimationFrame` loop, started once as soon as this module is
// first imported on the client). `createSignalScopeAnimator()` still
// returns a `{ tick }` function with the same signature as before — every
// caller just reads the same shared `sim` state and draws it onto their
// own canvas at their own size/position/colors/intensity. Since the
// Loader's canvas and the real hero's canvas are now always looking at
// the literal same moment in the same simulation, the handoff is
// seamless regardless of mount timing.
//
// The Lissajous trail is stored in normalized (-1..1-ish) units rather
// than absolute pixels, precisely so it stays meaningful across canvases
// of different sizes (the Loader draws at whatever size its handoff
// rect currently is, the real hero draws at its own fixed box size).

export type SignalScopeColors = { accent: string; ink: string };

type NormalizedPoint = { ux: number; uy: number };

const BAR_COUNT = 64;
const TRAIL_LENGTH = 140;

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const n = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const sim = {
  t: 0,
  ratio: 3.01,
  trail: [] as NormalizedPoint[],
  frame: 0,
};

let clockRunning = false;

function ensureClockRunning() {
  if (clockRunning || typeof window === "undefined") return;
  clockRunning = true;

  const step = () => {
    sim.frame++;
    sim.t += 0.016;
    sim.ratio = 3 + Math.sin(sim.t * 0.045) * 0.6;

    const ux = Math.sin(sim.t * sim.ratio);
    const uy = Math.sin(sim.t * 1.0 + Math.PI / 2.3) * 0.9;
    sim.trail.push({ ux, uy });
    if (sim.trail.length > TRAIL_LENGTH) sim.trail.shift();

    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Starts the shared clock the moment this module is evaluated on the
// client (whichever component — Loader or SignalScope — happens to mount
// first). `typeof window` guard keeps this a no-op during SSR.
ensureClockRunning();

export type SignalScopeTickOptions = {
  /** Pointer-driven parallax tilt (px), 0 when not applicable (e.g. the loader). */
  tiltX?: number;
  tiltY?: number;
  colors: SignalScopeColors;
  /**
   * 0–1. Scales bar amplitude / trace / dot opacity. The real hero
   * SignalScope always renders at intensity 1; the Loader ramps this up
   * from 0 as loading progresses.
   */
  intensity?: number;
  dpr: number;
  /**
   * Canvas-pixel offset (CSS px, pre-dpr) at which the (width × height)
   * scene should be drawn. Lets a single full-viewport canvas (the
   * Loader's) render the scope inside an arbitrary sub-rectangle —
   * e.g. exactly where the real hero SignalScope sits.
   */
  offsetX?: number;
  offsetY?: number;
};

export function createSignalScopeAnimator() {
  function tick(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opts: SignalScopeTickOptions,
  ): string | null {
    const {
      tiltX = 0,
      tiltY = 0,
      colors,
      intensity = 1,
      dpr,
      offsetX = 0,
      offsetY = 0,
    } = opts;

    if (width < 4 || height < 4) return null;

    // Maps this scene's local (0,0)–(width,height) space onto the canvas
    // at (offsetX, offsetY) — this is what lets the Loader draw the scope
    // inside an arbitrary sub-rectangle of its full-viewport canvas.
    ctx.setTransform(dpr, 0, 0, dpr, offsetX * dpr, offsetY * dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + tiltX * 10;
    const cy = height / 2 + tiltY * 8;
    const accent = hexToRgb(colors.accent);
    const ink = hexToRgb(colors.ink);

    // --- rotating radial spectrum ring ---
    const ringRadius = Math.min(width, height) * 0.32;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sim.t * 0.12);
    for (let i = 0; i < BAR_COUNT; i++) {
      const a = (i / BAR_COUNT) * Math.PI * 2;
      const amp =
        (0.22 +
          0.18 * Math.abs(Math.sin(sim.t * 0.9 + i * 0.35)) +
          0.14 * Math.abs(Math.sin(sim.t * 2.3 + i * 0.12)) +
          0.1 * Math.abs(Math.sin(i * 1.7))) *
        intensity;
      const len = ringRadius * 0.22 * (0.5 + amp);
      const x1 = Math.cos(a) * ringRadius;
      const y1 = Math.sin(a) * ringRadius * 0.55;
      const x2 = Math.cos(a) * (ringRadius + len);
      const y2 = Math.sin(a) * (ringRadius + len) * 0.55;
      const alpha = (0.1 + amp * 0.5) * intensity;
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    // --- Lissajous oscilloscope trace with phosphor persistence ---
    // Drawn from the shared, normalized trail — every canvas converts the
    // same sequence of (ux, uy) values to its own pixel space via its own
    // cx/cy/scopeR, so the relative motion is always identical everywhere
    // it's drawn.
    const scopeR = Math.min(width, height) * 0.17;
    let headX = cx;
    let headY = cy;

    for (let i = 1; i < sim.trail.length; i++) {
      const p0 = sim.trail[i - 1];
      const p1 = sim.trail[i];
      const x0 = cx + p0.ux * scopeR;
      const y0 = cy + p0.uy * scopeR;
      const x1 = cx + p1.ux * scopeR;
      const y1 = cy + p1.uy * scopeR;
      const age = i / sim.trail.length; // 0 = oldest, 1 = newest

      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${age * 0.85 * intensity})`;
      ctx.lineWidth = 1 + age * 1.6;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      if (i === sim.trail.length - 1) {
        headX = x1;
        headY = y1;
      }
    }

    // Glowing head of the trace
    ctx.save();
    ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.9 * intensity})`;
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.95 * intensity})`;
    ctx.beginPath();
    ctx.arc(headX, headY, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center reference dot
    ctx.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, ${0.18 * intensity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // HUD readout, updated a few times a second rather than every frame.
    // Tied to the shared clock's frame count now, not this particular
    // canvas's own draw calls.
    if (sim.frame % 6 === 0) {
      const peak = (-6 - Math.abs(Math.sin(sim.t * 0.7)) * 8).toFixed(1);
      const phase = Math.round((((sim.t * sim.ratio * 57.3) % 360) + 360) % 360);
      const corr = (Math.sin(sim.t * 0.31) * 0.5 + 0.5).toFixed(2);
      return `peak ${peak}db · phase ${phase}° · corr ${corr}`;
    }
    return null;
  }

  return { tick };
}
