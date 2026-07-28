"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "@/context/LocaleContext";

export function Loader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const { setLoaded } = useApp();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setLoaded(true);
      },
    });

    tl.to(counter, {
      val: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(counter.val)).padStart(2, "0");
        }
      },
    })
      .to(
        progressRef.current,
        { scaleX: 1, duration: 1.6, ease: "power2.inOut" },
        0,
      )
      .to(overlayRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        delay: 0.15,
      })
      .to(
        overlayRef.current,
        { opacity: 0, duration: 0.3 },
        "-=0.2",
      );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [setLoaded]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex flex-col justify-between bg-paper px-5 py-8 md:px-10 md:py-10"
      aria-hidden
    >
      <p className="font-display text-sm tracking-[0.12em] text-ink uppercase">
        baneoff
      </p>

      <div className="mx-auto w-full max-w-[1440px]">
        <p className="font-display text-[clamp(2rem,6vw,4rem)] leading-none tracking-[-0.02em] text-ink italic">
          sound producer
        </p>
        <div className="mt-8 h-px w-full bg-ink/10">
          <div
            ref={progressRef}
            className="h-full w-full origin-left scale-x-0 bg-accent"
          />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          loading
        </p>
        <span
          ref={counterRef}
          className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-none tracking-[-0.04em] text-ink tabular-nums"
        >
          00
        </span>
      </div>
    </div>
  );
}
