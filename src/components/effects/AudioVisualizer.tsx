"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BAR_COUNT = 32;

export function AudioVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const targetsRef = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.2),
  );
  const heightsRef = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.2),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let mouseY = 0.5;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseY = 1 - (e.clientY - rect.top) / rect.height;
    };

    const tick = () => {
      for (let i = 0; i < BAR_COUNT; i++) {
        if (Math.random() > 0.92) {
          const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          targetsRef.current[i] =
            0.15 + Math.random() * 0.85 * (1 - center * 0.4) * (0.5 + mouseY * 0.5);
        }
        heightsRef.current[i] +=
          (targetsRef.current[i] - heightsRef.current[i]) * 0.12;

        const bar = barsRef.current[i];
        if (bar) {
          bar.style.transform = `scaleY(${heightsRef.current[i]})`;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute top-[12%] left-[4%] hidden h-[clamp(120px,18vh,200px)] w-[clamp(140px,14vw,220px)] items-end justify-center gap-[3px] md:flex"
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) barsRef.current[i] = el;
          }}
          className="w-[3px] origin-bottom bg-accent/25 transition-colors duration-300"
          style={{
            height: "100%",
            transform: "scaleY(0.2)",
          }}
        />
      ))}
    </div>
  );
}

export function WaveformLine() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    let offset = 0;
    let rafId = 0;

    const tick = () => {
      offset += 0.015;
      const d = Array.from({ length: 80 }, (_, i) => {
        const x = i * 12;
        const y =
          24 +
          Math.sin(i * 0.25 + offset) * 12 +
          Math.sin(i * 0.08 + offset * 1.5) * 6;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ");
      path.setAttribute("d", d);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <svg
      className="pointer-events-none absolute -right-4 bottom-[20%] hidden h-12 w-[min(60vw,480px)] text-accent/20 md:block"
      viewBox="0 0 960 48"
      fill="none"
      aria-hidden
    >
      <path
        ref={pathRef}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FloatingBlob() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const pos = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const tick = () => {
      current.x += (pos.x - current.x) * 0.04;
      current.y += (pos.y - current.y) * 0.04;
      gsap.set(blob, { x: current.x, y: current.y, xPercent: -50, yPercent: -50 });
      requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    const rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed top-0 left-0 z-0 h-[420px] w-[420px] rounded-full opacity-[0.07] blur-[100px] will-change-transform"
      style={{
        background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
      }}
      aria-hidden
    />
  );
}
