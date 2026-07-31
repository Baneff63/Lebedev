"use client";

import { useEffect, useRef } from "react";
import type { ToolStackItem } from "@/types/site";

export function ToolsEllipse({ tools }: { tools: ToolStackItem[] }) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(0);

  useEffect(() => {
    if (tools.length === 0) return;
    let raf = 0;
    const n = tools.length;
    const radiusX = 210;
    const radiusZ = 100;

    const tick = () => {
      angleRef.current += 0.003;
      tools.forEach((_, i) => {
        const theta = angleRef.current + (i / n) * Math.PI * 2;
        const x = Math.cos(theta) * radiusX;
        const z = Math.sin(theta) * radiusZ;
        const depth = (z + radiusZ) / (2 * radiusZ); // 0 (back) .. 1 (front)
        const scale = 0.65 + depth * 0.55;
        const el = itemRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${x}px, ${(1 - depth) * 8}px, 0) scale(${scale})`;
          el.style.opacity = String(0.35 + depth * 0.65);
          el.style.zIndex = String(Math.round(depth * 100));
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tools]);

  if (tools.length === 0) return null;

  return (
    <div
      className="relative mx-auto h-[280px] w-full max-w-[560px]"
      style={{ perspective: "900px" }}
      aria-label="Инструменты"
    >
      <div
        className="absolute top-1/2 left-1/2 h-0 w-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {tools.map((tool, i) => (
          <div
            key={tool.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[13px] tracking-[0.04em] whitespace-nowrap text-ink shadow-[var(--shadow-card)]"
          >
            {tool.name}
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-[2px]"
        aria-hidden
      />
    </div>
  );
}
