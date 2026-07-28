"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "@/context/LocaleContext";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { isLoaded } = useApp();

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    document.documentElement.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });
    if (label) gsap.set(label, { opacity: 0, y: 8 });

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let rafId = 0;
    let currentLabel = "";

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.to(dot, {
        x: pos.x,
        y: pos.y,
        opacity: 1,
        duration: 0.12,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(ring, { opacity: 1, duration: 0.2 });
      if (label) {
        gsap.to(label, { x: pos.x + 18, y: pos.y + 18, duration: 0.15, ease: "power2.out" });
      }
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.14;
      ringPos.y += (pos.y - ringPos.y) * 0.14;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onEnter = () => {
      gsap.to(ring, {
        scale: 2.4,
        borderColor: "var(--cursor-ring-hover)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot, { scale: 0.4, duration: 0.3, ease: "power3.out" });
    };

    const onLeave = () => {
      gsap.to(ring, {
        scale: 1,
        borderColor: "var(--cursor-ring)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
      if (label && currentLabel) {
        currentLabel = "";
        gsap.to(label, { opacity: 0, y: 8, duration: 0.2 });
      }
    };

    const onOver = (e: Event) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-cursor]",
      ) as HTMLElement | null;

      if (target) {
        onEnter();
        const labelText = target.getAttribute("data-cursor-label");
        if (label && labelText && labelText !== currentLabel) {
          currentLabel = labelText;
          label.textContent = labelText;
          gsap.to(label, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" });
        } else if (label && !labelText && currentLabel) {
          currentLabel = "";
          gsap.to(label, { opacity: 0, y: 8, duration: 0.2 });
        }
      } else {
        onLeave();
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (dot && ring) {
      gsap.fromTo(
        [dot, ring],
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 0.2 },
      );
    }
  }, [isLoaded]);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-accent will-change-transform"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-9 w-9 rounded-full border will-change-transform"
        style={{ borderColor: "var(--cursor-ring)" }}
        aria-hidden
      />
      <span
        ref={labelRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] text-[10px] tracking-[0.2em] text-accent uppercase will-change-transform"
        aria-hidden
      />
    </>
  );
}
