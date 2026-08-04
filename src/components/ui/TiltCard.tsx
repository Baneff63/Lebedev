"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fix (portfolio grid hover bug): the 3D tilt used to rotate the card
 * fairly aggressively (`rotateY/rotateX(±8deg)` under a tight
 * `perspective(800px)`, plus `scale(1.02)`). Under perspective, rotating
 * a box makes its corners travel outside its original layout rectangle —
 * that's expected for a tilt effect, but combined with a *tight*
 * perspective value the amount of travel was large enough that a
 * hovered card's corner would visibly poke into the neighboring grid
 * cell. Because siblings share the same stacking context with no
 * explicit z-index, whichever card comes later in the DOM simply painted
 * on top of that overflow — so the hovered card looked like it was
 * getting clipped/cut off by its neighbor, reading as a rendering bug
 * rather than an intentional tilt.
 *
 * Two changes fix this without removing the effect:
 * 1. A larger `perspective` (1400px) and gentler rotation/scale values
 *    drastically reduce how far the corners travel outside the card's
 *    own box, so overlap into a neighboring cell becomes rare in normal
 *    grid layouts with a real gap.
 * 2. The hovered card now raises its own `z-index` for the duration of
 *    the hover (and needs `position: relative` for that to have any
 *    effect), so on the rare occasion it still does overlap a neighbor,
 *    it always renders on top instead of getting cut off underneath it —
 *    which reads as intentional ("this card is popping toward you").
 */
export function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1400px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.015)`;
    el.style.zIndex = "20";
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(1400px) rotateY(0deg) rotateX(0deg) scale(1)";
    el.style.zIndex = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
