"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { VerticalLabel } from "@/components/effects/VerticalLabel";
import { ScrambleText } from "@/components/ui/ScrambleText";

export function Philosophy() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".philosophy-headline .line", {
        scrollTrigger: { trigger: ".philosophy-headline", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".philosophy-item", {
        scrollTrigger: { trigger: ".philosophy-list", start: "top 75%" },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.philosophy.headline.split("\n");

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-24 md:px-10 md:py-40"
    >
      <SectionNumber num="02" className="bottom-8 left-4 md:left-10" />
      <VerticalLabel
        text={t.philosophy.side}
        className="absolute top-1/2 right-3 -translate-y-1/2 md:right-6"
      />

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              {t.philosophy.label}
            </p>
            <h2 className="philosophy-headline mt-8 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              {headlineLines.map((line) => (
                <span key={line} className="line block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <div className="philosophy-list md:col-span-8 md:col-start-5">
            {t.philosophy.items.map((item) => (
              <article
                key={item.num}
                className="philosophy-item group grid grid-cols-1 gap-4 border-t border-ink/8 py-10 md:grid-cols-12 md:gap-8"
                data-cursor
                data-cursor-label={item.num}
              >
                <p className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-[-0.03em] text-ink/10 transition-colors duration-500 group-hover:text-accent/30 md:col-span-2">
                  {item.num}
                </p>
                <div className="md:col-span-4">
                  <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.15] tracking-[-0.01em] text-ink">
                    <ScrambleText text={item.title} />
                  </h3>
                </div>
                <p className="text-[15px] leading-[1.7] text-muted md:col-span-6 md:pt-1">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
