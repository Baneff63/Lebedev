"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        // inline-flex вместо обычного div: убирает "фантомный" отступ
        // строчного контекста, из-за которого кнопка внутри Magnetic
        // визуально проваливалась ниже соседних inline-flex кнопок.
        display: "inline-flex",
      }}
    >
      {children}
    </div>
  );
}