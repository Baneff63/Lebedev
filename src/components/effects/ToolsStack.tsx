"use client";

import { useEffect, useState } from "react";
import type { ToolStackItem } from "@/types/site";
import { ToolsOrbit3D } from "./ToolsOrbit3D";

type ToolsStackProps = {
  tools: ToolStackItem[];
  className?: string;
};

/**
 * The rotating 3D carousel needs real room to breathe (a wide stage,
 * comfortable card spacing) to read as impressive rather than cramped —
 * on a phone-width screen there just isn't enough space for it, and
 * squeezing it in made cards overlap/clip each other. Rather than trying
 * to shrink the 3D scene down further, it's simply desktop-only: on
 * anything narrower than `md` this renders a plain wrapped row of tool
 * pills instead — same data, same links, zero animation/pointer/rAF
 * overhead, and it never looks broken because there's nothing dynamic to
 * break.
 *
 * The `md` check happens in JS (matchMedia) rather than pure CSS
 * (`hidden md:block`) so the 3D version's drag/rAF listeners never even
 * mount on mobile — not just visually hidden, but not running at all.
 */
export function ToolsStack({ tools, className = "" }: ToolsStackProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (tools.length === 0) return null;

  // Before we know the real viewport (or on anything narrower than `md`),
  // render the simple static list — this also doubles as the safe default
  // during SSR/hydration, so there's no flash of the wrong version.
  if (!mounted || !isDesktop) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}>
        {tools.map((tool) =>
          tool.url ? (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              data-cursor-label="open"
              className="rounded-full border border-ink/12 bg-paper px-4 py-2 text-[13px] text-ink shadow-[var(--shadow-card)] transition-colors hover:border-accent hover:text-accent"
            >
              {tool.name}
            </a>
          ) : (
            <span
              key={tool.id}
              className="rounded-full border border-ink/8 bg-paper/85 px-4 py-2 text-[13px] text-ink/75 shadow-[var(--shadow-card)]"
            >
              {tool.name}
            </span>
          ),
        )}
      </div>
    );
  }

  return <ToolsOrbit3D tools={tools} className={className} />;
}
