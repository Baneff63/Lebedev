"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { TiltCard } from "@/components/ui/TiltCard";

export function Work() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".work-intro .line", {
        scrollTrigger: { trigger: ".work-intro", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".work-body", {
        scrollTrigger: { trigger: ".work-body", start: "top 85%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".work-card", {
        scrollTrigger: { trigger: ".work-grid", start: "top 75%" },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.work.headline.split("\n");

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-24 md:px-10 md:py-40"
    >
      <SectionNumber num="03" className="top-12 right-4 md:right-10" />

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              {t.work.label}
            </p>
            <h2 className="work-intro mt-8 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              {headlineLines.map((line, i) => (
                <span
                  key={line}
                  className={`line block ${i === 1 ? "italic text-accent" : ""}`}
                >
                  {line}
                </span>
              ))}
            </h2>
            <p className="work-body mt-8 max-w-[360px] text-[15px] leading-[1.7] text-muted">
              {t.work.body}
            </p>
            <p className="mt-6 text-[12px] tracking-[0.04em] text-muted/70 italic">
              {t.work.placeholder}
            </p>

            <div className="mt-10 hidden items-center gap-3 md:flex" aria-hidden>
              <span className="h-px flex-1 max-w-[80px] bg-accent/30" />
              <span className="text-[10px] tracking-[0.25em] text-muted/50 uppercase">
                {t.work.nda} only
              </span>
            </div>
          </div>

          <div className="work-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-7 md:col-start-6 md:gap-5">
            {t.work.projects.map((project, i) => (
              <TiltCard key={project.title} className="work-card">
                <article
                  className="group relative aspect-[4/3] overflow-hidden"
                  data-cursor
                  data-cursor-label={t.work.cursorLabel}
                >
                  <div
                    className={[
                      "absolute inset-0 scale-110 blur-2xl transition-transform duration-700 ease-out-expo group-hover:scale-125",
                      `work-blur-${i}`,
                    ].join(" ")}
                  />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                  <div className="scanlines pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
                    <span className="self-start border border-on-dark/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-on-dark/80">
                      {t.work.nda}
                    </span>

                    <div className="translate-y-2 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-display text-lg tracking-[-0.01em] text-on-dark">
                        {project.title}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-on-dark/50">
                        {project.tag}
                      </p>
                    </div>
                  </div>
                </article>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
