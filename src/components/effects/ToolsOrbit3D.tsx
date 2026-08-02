"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { ToolStackItem } from "@/types/site";

type ToolsOrbit3DProps = {
  tools: ToolStackItem[];
  className?: string;
};

/**
 * Real CSS 3D carousel (not a 2D ellipse faked with math): the whole ring
 * lives inside a `perspective` stage, each card sits on its own face via
 * `rotateY(i * step) translateZ(radius)` with `transform-style: preserve-3d`,
 * and the ring itself gets `rotateY(angle)` every frame — so depth, size
 * and occlusion all come from the browser's actual 3D transform engine,
 * not from a lookup table.
 *
 * On top of that:
 * - it's grab-to-spin (pointer drag maps 1:1 to rotation, with momentum
 *   and easing on release),
 * - it auto-rotates when idle,
 * - the whole stage subtly tilts toward the cursor (rotateX/rotateY
 *   parallax) so it reads as sitting in real 3D space rather than a flat
 *   plane,
 * - a soft reflection + radial glow + drifting particle field sit behind
 *   it for depth,
 * - only the card currently facing the viewer is interactive/clickable.
 */
export function ToolsOrbit3D({ tools, className = "" }: ToolsOrbit3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const angleRef = useRef(0);
  const velocityRef = useRef(0.12); // deg/frame, idle auto-spin speed
  const draggingRef = useRef(false);
  const lastPointerX = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const parallaxTarget = useRef({ x: 0, y: 0 });

  const [radius, setRadius] = useState(0);
  const [dragging, setDragging] = useState(false);

  const n = tools.length;
  const step = n > 0 ? 360 / n : 0;

  // Card box size — kept in sync with the marginLeft/marginTop centering
  // offsets below. Slightly smaller than before so the carousel reads
  // cleanly on narrow phone screens too.
  const CARD_W = 116;
  const CARD_H = 40;

  // Deterministic per-particle values so they don't reshuffle on re-render.
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: (Math.sin(i * 12.9898) * 0.5 + 0.5) * 100,
        top: (Math.sin(i * 78.233 + 4) * 0.5 + 0.5) * 100,
        size: 1 + (i % 4),
        delay: (i % 7) * 0.6,
        duration: 6 + (i % 5) * 1.4,
      })),
    [],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      // Radius scales with stage width but is capped so cards never crowd
      // together on very wide screens or collapse/overflow on narrow ones.
      setRadius(Math.min(Math.max(w * 0.32, 78), 240));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (n === 0) return;
    let raf = 0;

    const tick = () => {
      if (!draggingRef.current) {
        angleRef.current += velocityRef.current;
        // Idle drift decays toward the resting auto-spin speed rather than
        // snapping, so a flick continues to feel like it has momentum.
        velocityRef.current += (0.12 - velocityRef.current) * 0.015;
      }

      parallax.current.x += (parallaxTarget.current.x - parallax.current.x) * 0.06;
      parallax.current.y += (parallaxTarget.current.y - parallax.current.y) * 0.06;

      const ring = ringRef.current;
      if (ring) {
        ring.style.transform = `rotateX(${parallax.current.y}deg) rotateY(${
          angleRef.current + parallax.current.x
        }deg)`;
      }

      let frontIndex = 0;
      let frontCos = -Infinity;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const theta = ((angleRef.current + i * step) * Math.PI) / 180;
        const cos = Math.cos(theta);
        if (cos > frontCos) {
          frontCos = cos;
          frontIndex = i;
        }
        // depth: 1 = facing the viewer, 0 = facing away
        const depth = (cos + 1) / 2;
        const scale = 0.62 + depth * 0.5;
        const opacity = 0.3 + depth * 0.7;
        const blur = (1 - depth) * 3;
        card.style.opacity = String(opacity);
        card.style.filter = blur > 0.2 ? `blur(${blur}px)` : "none";
        card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px) scale(${scale})`;
        card.style.zIndex = String(Math.round(depth * 100));
      });

      cardRefs.current.forEach((card, i) => {
        if (card) card.style.pointerEvents = i === frontIndex ? "auto" : "none";
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, step, radius]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    lastPointerX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxTarget.current = { x: relX * 22, y: -relY * 12 };
    }

    if (!draggingRef.current) return;
    const delta = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;
    angleRef.current += delta * 0.35;
    velocityRef.current = delta * 0.06;
  };

  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  const onLeaveStage = () => {
    parallaxTarget.current = { x: 0, y: 0 };
  };

  if (n === 0) return null;

  return (
    <div
      ref={stageRef}
      className={`relative h-full w-full touch-none select-none ${className}`}
      style={{ perspective: "1400px" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        endDrag();
        onLeaveStage();
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[80px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Drifting particle field for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-accent/40 orbit-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Floor reflection */}
      <div
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] opacity-30 blur-xl"
        style={{ background: "radial-gradient(ellipse, var(--ink) 0%, transparent 75%)" }}
        aria-hidden
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          transformStyle: "preserve-3d",
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <div
          ref={ringRef}
          className="relative"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {tools.map((tool, i) => (
            <div
              key={tool.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              // Bug fix: these used to be anchored with `top-1/2 left-1/2`
              // (i.e. 50% of the *parent's* box). The parent here
              // (`ringRef`) has no in-flow content of its own — every card
              // is `position: absolute`, which is exactly what makes an
              // element's intrinsic size collapse to 0 in a shrink-to-fit
              // box — so "50%" was resolving to 50% of a 0×0 box, i.e. 0.
              // Every card ended up anchored at the ring's literal
              // top-left corner instead of its center, which is what read
              // as the carousel "not working"/cards overlapping in a
              // corner. Anchoring at 0,0 sidesteps the issue entirely: the
              // actual centering + depth positioning is done purely via
              // the `rotateY/translateZ` transform set in the animation
              // loop below, which doesn't depend on the parent's box size
              // at all.
              className="absolute top-0 left-0 will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                marginLeft: `-${CARD_W / 2}px`,
                marginTop: `-${CARD_H / 2}px`,
              }}
            >
              {tool.url ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  data-cursor-label="open"
                  draggable={false}
                  onClick={(e) => {
                    if (draggingRef.current) e.preventDefault();
                  }}
                  style={{ width: `${CARD_W}px`, height: `${CARD_H}px` }}
                  className="flex items-center justify-center rounded-2xl border border-ink/12 bg-paper px-3 text-[13px] font-medium whitespace-nowrap text-ink shadow-[var(--shadow-card)] transition-colors hover:border-accent hover:text-accent"
                >
                  {tool.name}
                </a>
              ) : (
                <span
                  style={{ width: `${CARD_W}px`, height: `${CARD_H}px` }}
                  className="flex items-center justify-center rounded-2xl border border-ink/8 bg-paper/85 px-3 text-[13px] whitespace-nowrap text-ink/75 shadow-[var(--shadow-card)]"
                >
                  {tool.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-muted/50">
        drag to spin
      </p>
    </div>
  );
}
