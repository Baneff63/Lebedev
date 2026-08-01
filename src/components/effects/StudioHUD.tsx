"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/context/LocaleContext";

export function StudioHUD() {
  const { t } = useLocale();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [bpm, setBpm] = useState(124);
  const bpmRef = useRef(124);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    const bpmInterval = setInterval(() => {
      const drift = (Math.random() - 0.5) * 2;
      bpmRef.current = Math.max(118, Math.min(128, bpmRef.current + drift));
      setBpm(Math.round(bpmRef.current));
    }, 800);

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      clearInterval(bpmInterval);
    };
  }, []);

  return (
    <div
      // Positioning (bottom offset) now lives in globals.css (.studio-hud),
      // so it automatically sits above the footer bar or the audio player.
      className="studio-hud pointer-events-none fixed left-5 z-40 hidden font-body text-[10px] tracking-[0.12em] text-muted/70 uppercase md:block md:left-10"
      aria-hidden
    >
      <div className="flex flex-col gap-1.5 tabular-nums">
        <span>
          x <span className="text-ink/50">{coords.x}</span> y{" "}
          <span className="text-ink/50">{coords.y}</span>
        </span>
        <span>
          {t.hud.bpm}{" "}
          <span className="text-accent/70">{bpm}</span>
        </span>
      </div>
    </div>
  );
}
