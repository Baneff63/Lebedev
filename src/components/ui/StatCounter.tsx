"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "@/lib/gsapScrollTrigger";

type StatCounterProps = {
  target?: number;
  suffix?: string;
  symbol?: string;
  className?: string;
};

export function StatCounter({
  target,
  suffix = "",
  symbol,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (symbol) {
      const scramble = { val: 0 };
      const chars = "0123456789";

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          if (triggered.current) return;
          triggered.current = true;

          gsap.to(scramble, {
            val: 12,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              const i = Math.floor(scramble.val);
              el.textContent =
                i < 11
                  ? chars[Math.floor(Math.random() * chars.length)]
                  : symbol;
            },
            onComplete: () => {
              el.textContent = symbol;
            },
          });
        },
      });

      return () => st.kill();
    }

    if (target === undefined) return;

    const counter = { val: 0 };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        if (triggered.current) return;
        triggered.current = true;

        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(counter.val)}${suffix}`;
          },
        });
      },
    });

    return () => st.kill();
  }, [target, suffix, symbol]);

  const initial = symbol ?? `0${suffix}`;

  return (
    <span ref={ref} className={className}>
      {initial}
    </span>
  );
}
