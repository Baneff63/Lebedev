"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { StatCounter } from "@/components/ui/StatCounter";
import { SectionNumber } from "@/components/effects/SectionNumber";

/**
 * First "chapter" after the hero in the home scroll story. Deliberately
 * reuses `t.about.stats` (label + numbers already exist in content.ts,
 * used on nothing else right now) rather than introducing new copy — new
 * text would have to live either in content.ts (which the already-
 * deployed Vercel Blob site-data.json wouldn't have until someone runs
 * /api/admin/sync-content) or hardcoded outside the CMS entirely. Reusing
 * an existing, already-synced field sidesteps that problem completely.
 */
export function HomeStats() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".home-stats-label", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".home-stat", {
        scrollTrigger: { trigger: ".home-stats-grid", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-20 md:px-10 md:py-32"
    >
      <SectionNumber num="01" className="top-8 right-4 md:right-10" />

      <div className="mx-auto w-full max-w-[1440px]">
        <p className="home-stats-label text-[11px] uppercase tracking-[0.22em] text-muted">
          {t.about.label}
        </p>

        <div className="home-stats-grid mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {t.about.stats.map((stat) => (
            <div key={stat.label} className="home-stat">
              <p className="font-display text-[clamp(2.75rem,7vw,5rem)] leading-none tracking-[-0.03em] text-ink tabular-nums">
                {"symbol" in stat && stat.symbol ? (
                  <StatCounter symbol={stat.symbol} />
                ) : (
                  <StatCounter
                    target={"target" in stat ? stat.target : undefined}
                    suffix={"suffix" in stat ? stat.suffix : ""}
                  />
                )}
              </p>
              <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
