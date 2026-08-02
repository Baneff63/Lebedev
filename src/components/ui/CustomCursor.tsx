"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "@/context/LocaleContext";

/**
 * Fix notes (see README):
 * - The ring used to be a plain HTML div with a `border`, scaled up via
 *   `transform: scale(2.4)` on hover. Scaling a border like that makes the
 *   browser rasterize a 1px border at a fractional sub-pixel width, which
 *   is what read as "ugly/blurry" quality. An SVG circle stays vector-crisp
 *   at any scale, so the ring is now SVG instead of a bordered div.
 * - The hover label used to rely on `mouseover`/`mouseout` bubbling. That's
 *   flaky: fast pointer movement across adjacent elements, or elements
 *   overlapping in z-index, can make the browser skip firing mouseout on
 *   the old target, so the label sometimes got stuck showing (or, less
 *   often, cleared while still hovering something with a label). Hover
 *   state is now derived every animation frame from
 *   `document.elementFromPoint(x, y)`, which is always accurate regardless
 *   of event ordering, and there's an explicit `mouseleave` on the window
 *   to reset everything if the pointer exits the viewport entirely.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const ringCircleRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { isLoaded } = useApp();

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    document.documentElement.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;
    const ringCircle = ringCircleRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !ringCircle) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });
    if (label) gsap.set(label, { opacity: 0, y: 8 });

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let rafId = 0;
    let currentLabel = "";
    let isHovering = false;

    const setHoverState = (target: Element | null) => {
      const hoverEl = target?.closest("a, button, [data-cursor]") ?? null;

      if (hoverEl && !isHovering) {
        isHovering = true;
        gsap.to(ring, {
          scale: 1.7,
          duration: 0.4,
          ease: "power3.out",
        });
        gsap.to(dot, { scale: 0.4, duration: 0.3, ease: "power3.out" });
        gsap.to(ringCircle, {
          attr: { stroke: "var(--cursor-ring-hover)" },
          duration: 0.4,
        });
      } else if (!hoverEl && isHovering) {
        isHovering = false;
        gsap.to(ring, { scale: 1, duration: 0.4, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
        gsap.to(ringCircle, {
          attr: { stroke: "var(--cursor-ring)" },
          duration: 0.4,
        });
      }

      const labelText = hoverEl?.getAttribute("data-cursor-label") ?? "";
      if (label) {
        if (labelText && labelText !== currentLabel) {
          currentLabel = labelText;
          label.textContent = labelText;
          gsap.to(label, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" });
        } else if (!labelText && currentLabel) {
          currentLabel = "";
          gsap.to(label, { opacity: 0, y: 8, duration: 0.2 });
        }
      }
    };

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

      setHoverState(document.elementFromPoint(e.clientX, e.clientY));
    };

    const onLeaveWindow = () => {
      isHovering = false;
      currentLabel = "";
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      if (label) gsap.to(label, { opacity: 0, duration: 0.15 });
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.14;
      ringPos.y += (pos.y - ringPos.y) * 0.14;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseleave", onLeaveWindow);
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
      {/* SVG ring — stays crisp (vector) at any transform scale, unlike a
          bordered div, which is what caused the blurry/low-quality look. */}
      <svg
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-9 w-9 overflow-visible will-change-transform"
        viewBox="0 0 36 36"
        aria-hidden
      >
        <circle
          ref={ringCircleRef}
          cx="18"
          cy="18"
          r="16.5"
          fill="none"
          stroke="var(--cursor-ring)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        ref={labelRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] text-[10px] tracking-[0.2em] text-accent uppercase will-change-transform"
        aria-hidden
      />
    </>
  );
}
