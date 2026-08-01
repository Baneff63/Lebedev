"use client";

import { useEffect, useRef, useState } from "react";
import type { ToolStackItem } from "@/types/site";

type ToolsEllipseProps = {
  tools: ToolStackItem[];
  className?: string;
};

/**
 * A rotating "orbit" of tool pills. Rather than faking perspective with a
 * handful of guessed numbers, this measures its own container (so it can
 * genuinely fill whatever space it's given) and gives every item a
 * horizontal + vertical position along an ellipse, plus a depth value
 * derived from where it sits on that ellipse. That depth drives scale,
 * opacity, blur and stacking order — items on the "near" edge of the
 * ellipse come forward (bigger, sharp, fully opaque, on top), items on the
 * "far" edge recede (smaller, faded, slightly soft) — which is what
 * actually reads as volume instead of a flat ring of equally-sized tags.
 *
 * Hovering the whole stage pauses the rotation (so a user can actually aim
 * for a pill instead of chasing a moving target), and any item with a
 * `url` set in the CMS becomes a real link that opens the tool's site.
 */
export function ToolsEllipse({ tools, className = "" }: ToolsEllipseProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const radiusX = size.width * 0.44;
  const radiusY = Math.min(size.height * 0.34, radiusX * 0.46);

  useEffect(() => {
    if (tools.length === 0 || radiusX === 0) return;
    const n = tools.length;
    let raf = 0;

    const tick = () => {
      if (!pausedRef.current) angleRef.current += 0.0022;

      tools.forEach((_, i) => {
        const theta = angleRef.current + (i / n) * Math.PI * 2;
        const x = Math.cos(theta) * radiusX;
        const y = Math.sin(theta) * radiusY;
        // 0 = far edge of the orbit (small, faint, behind), 1 = near edge
        // (large, sharp, in front) — this is the whole "volume" illusion.
        const depth = (Math.sin(theta) + 1) / 2;
        const scale = 0.52 + depth * 0.72;
        const opacity = 0.24 + depth * 0.76;
        const blur = (1 - depth) * 1.8;

        const el = cardRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
          el.style.opacity = String(opacity);
          el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
          el.style.zIndex = String(Math.round(depth * 100) + 10);
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tools, radiusX, radiusY]);

  if (tools.length === 0) return null;

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Ambient glow — gives the whole thing a sense of occupying real
          space rather than text floating flat on the page. */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[70px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden
      />

      <div
        ref={stageRef}
        className="relative h-full w-full"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        {/* Faint orbit-path guide, sized to match the actual travel path —
            a subtle but effective cue that the pills are moving along a
            real track, not just drifting. */}
        {radiusX > 0 && (
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/10"
            style={{ width: `${radiusX * 2}px`, height: `${radiusY * 2}px` }}
            aria-hidden
          />
        )}

        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/50 blur-[1px]"
          aria-hidden
        />

        {tools.map((tool, i) => (
          <div
            key={tool.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 will-change-transform"
          >
            {tool.url ? (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label="open"
                className="block cursor-pointer rounded-full border border-ink/12 bg-paper px-4 py-2 text-[13px] whitespace-nowrap text-ink shadow-[var(--shadow-card)] transition-colors hover:border-accent hover:text-accent"
              >
                {tool.name}
              </a>
            ) : (
              <span className="block rounded-full border border-ink/8 bg-paper/80 px-4 py-2 text-[13px] whitespace-nowrap text-ink/75 shadow-[var(--shadow-card)]">
                {tool.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
