"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { StatCounter } from "@/components/ui/StatCounter";
import { SectionNumber } from "@/components/effects/SectionNumber";

export function About() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-label", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".about-headline .line", {
        scrollTrigger: { trigger: ".about-headline", start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".about-body", {
        scrollTrigger: { trigger: ".about-body", start: "top 85%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.from(".about-stat", {
        scrollTrigger: { trigger: ".about-stats", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".about-tool", {
        scrollTrigger: { trigger: ".about-tools", start: "top 85%" },
        x: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.about.headline.split("\n");

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-24 md:px-10 md:py-40"
    >
      <SectionNumber num="01" className="top-8 right-4 md:right-10" />

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
        <div className="about-label md:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {t.about.label}
          </p>
        </div>

        <div className="md:col-span-6">
          <h2 className="about-headline font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.02em] text-ink">
            {headlineLines.map((line, i) => (
              <span key={line} className="line block overflow-hidden">
                <span
                  className={
                    i === headlineLines.length - 1 ? "italic text-accent" : ""
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className="about-body mt-10 max-w-[480px] text-[15px] leading-[1.75] tracking-[0.01em] text-muted">
            {t.about.body}
          </p>
        </div>

        <div className="about-stats flex flex-col gap-10 md:col-span-3 md:col-start-10 md:pt-2">
          {t.about.stats.map((stat) => (
            <div key={stat.label} className="about-stat relative">
              <span
                className="absolute -left-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-accent/30 md:block"
                aria-hidden
              />
              <p className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.03em] text-ink tabular-nums">
                {"symbol" in stat && stat.symbol ? (
                  <StatCounter symbol={stat.symbol} />
                ) : (
                  <StatCounter
                    target={"target" in stat ? stat.target : undefined}
                    suffix={"suffix" in stat ? stat.suffix : ""}
                  />
                )}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="about-tools md:col-span-12 md:mt-8">
          <div className="flex flex-col gap-6 border-t border-ink/8 pt-10 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              {t.about.tools.label}
            </p>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {t.about.tools.items.map((item) => (
                <li
                  key={item}
                  data-cursor
                  data-cursor-label={item.toLowerCase()}
                  className="about-tool text-[13px] tracking-[0.04em] text-ink/70 transition-colors hover:text-accent"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
