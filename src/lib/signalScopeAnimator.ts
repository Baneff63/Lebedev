// Shared drawing routine behind the "signal scope" visual: a rotating
// radial spectrum ring plus a slowly-morphing Lissajous trace with
// phosphor-style persistence, drawn on a 2D canvas.
//
// This used to live only inside SignalScope.tsx (the decorative element on
// the right side of the homepage hero). It's now factored out so the
// Loader can draw the *exact same visual* — same math, same trail
// behavior, same styling — rather than a different-looking placeholder
// "ring" that merely lived in the same neighborhood conceptually. Sharing
// the function (not just copying the look) is what makes the loading
// visual able to convincingly "become" the real hero element once the
// loader hands off to it.

export type SignalScopeColors = { accent: string; ink: string };

type Point = { x: number; y: number };

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

export type SignalScopeTickOptions = {
  /** Pointer-driven parallax tilt (px), 0 when not applicable (e.g. the loader). */
  tiltX?: number;
  tiltY?: number;
  colors: SignalScopeColors;
  /**
   * 0–1. Scales bar amplitude / trace / dot opacity. The real hero
   * SignalScope always renders at intensity 1; the Loader ramps this up
   * from 0 as loading progresses, so the visual visibly "wakes up" and
   * matches the real thing's full intensity right as loading finishes.
   */
  intensity?: number;
  dpr: number;
  /**
   * Canvas-pixel offset (CSS px, pre-dpr) at which the (width × height)
   * scene should be drawn. Lets a single full-viewport canvas (the
   * Loader's) render the scope inside an arbitrary sub-rectangle — e.g.
   * exactly where the real hero SignalScope sits — instead of needing a
   * dedicated canvas sized to that rectangle.
   */
  offsetX?: number;
  offsetY?: number;
};

export function createSignalScopeAnimator() {
  const trail: Point[] = [];
  let t = 0;
  let ratio = 3.01; // Lissajous frequency ratio, drifts slowly over time
  let frame = 0;

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

    frame++;
    t += 0.016;
    ratio = 3 + Math.sin(t * 0.045) * 0.6;

    // Maps this scene's local (0,0)–(width,height) space onto the canvas
    // at (offsetX, offsetY) — this is what lets the Loader draw the scope
    // inside an arbitrary sub-rectangle of its full-viewport canvas.
    ctx.setTransform(dpr, 0, 0, dpr, offsetX * dpr, offsetY * dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + tiltX * 10;
    const cy = height / 2 + tiltY * 8;
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
      const amp =
        (0.22 +
          0.18 * Math.abs(Math.sin(t * 0.9 + i * 0.35)) +
          0.14 * Math.abs(Math.sin(t * 2.3 + i * 0.12)) +
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
    const scopeR = Math.min(width, height) * 0.17;
    const px = cx + Math.sin(t * ratio) * scopeR;
    const py = cy + Math.sin(t * 1.0 + Math.PI / 2.3) * scopeR * 0.9;
    trail.push({ x: px, y: py });
    if (trail.length > TRAIL_LENGTH) trail.shift();

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const age = i / trail.length; // 0 = oldest, 1 = newest
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${age * 0.85 * intensity})`;
      ctx.lineWidth = 1 + age * 1.6;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // Glowing head of the trace
    ctx.save();
    ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.9 * intensity})`;
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.95 * intensity})`;
    ctx.beginPath();
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center reference dot
    ctx.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, ${0.18 * intensity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // HUD readout, updated a few times a second rather than every frame
    if (frame % 6 === 0) {
      const peak = (-6 - Math.abs(Math.sin(t * 0.7)) * 8).toFixed(1);
      const phase = Math.round((((t * ratio * 57.3) % 360) + 360) % 360);
      const corr = (Math.sin(t * 0.31) * 0.5 + 0.5).toFixed(2);
      return `peak ${peak}db · phase ${phase}° · corr ${corr}`;
    }
    return null;
  }

  return { tick };
}
