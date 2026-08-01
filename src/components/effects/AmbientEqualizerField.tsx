"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BAR_COUNT = 56;

type AmbientEqualizerFieldProps = {
  className?: string;
};

/**
 * Very low-opacity ambient backdrop: a wide field of thin bars that
 * slowly and continuously "fill" up and down, like a spectrum analyzer
 * idling in the background of a studio. Purely decorative (aria-hidden,
 * pointer-events-none, no dependency on the real player) — meant to sit
 * behind page content without competing with it. Matches the audio-brand
 * language already used elsewhere on the site (AudioVisualizer, waveform,
 * card equalizers) but is intentionally muted (opacity ~0.05) and slow
 * (3.5–7.5s per bar) so it reads as texture, not motion.
 */
export function AmbientEqualizerField({ className = "" }: AmbientEqualizerFieldProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!fine) return;

    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const base = 0.08 + Math.abs(Math.sin(i * 12.9898)) * 0.55;
        gsap.set(bar, { scaleY: base });
        gsap.to(bar, {
          scaleY: () => 0.06 + Math.random() * 0.85,
          duration: () => 3.5 + Math.random() * 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.035,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex h-[34%] items-end justify-between gap-[2px] opacity-[0.05] ${className}`}
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="w-full origin-bottom rounded-t-sm bg-ink"
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}
