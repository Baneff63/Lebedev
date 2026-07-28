"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";

export function StudioHUD() {
  const { t } = useLocale();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [scrollPct, setScrollPct] = useState(0);
  const [bpm, setBpm] = useState(124);
  const bpmRef = useRef(124);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrollPct(Math.round(self.progress * 100)),
    });

    const bpmInterval = setInterval(() => {
      const drift = (Math.random() - 0.5) * 2;
      bpmRef.current = Math.max(118, Math.min(128, bpmRef.current + drift));
      setBpm(Math.round(bpmRef.current));
    }, 800);

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      st.kill();
      clearInterval(bpmInterval);
    };
  }, []);

  return (
    <div
      className="studio-hud pointer-events-none fixed bottom-6 left-5 z-40 hidden font-body text-[10px] tracking-[0.12em] text-muted/70 uppercase md:block md:left-10"
      aria-hidden
    >
      <div className="flex flex-col gap-1.5 tabular-nums">
        <span>
          {t.hud.scroll}{" "}
          <span className="text-ink/50">{String(scrollPct).padStart(3, "0")}%</span>
        </span>
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
