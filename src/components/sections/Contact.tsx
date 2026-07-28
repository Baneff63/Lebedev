"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { Magnetic } from "@/components/ui/Magnetic";

export function Contact() {
  const { t, links } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-headline .line", {
        scrollTrigger: { trigger: ".contact-headline", start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".contact-cta", {
        scrollTrigger: { trigger: ".contact-cta", start: "top 85%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.contact.headline.split("\n");

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-24 md:px-10 md:py-40"
    >
      <SectionNumber num="04" className="bottom-4 left-1/2 -translate-x-1/2" />

      <p
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(4rem,15vw,12rem)] leading-none tracking-[-0.03em] text-ink/[0.03] lowercase"
        aria-hidden
      >
        @
      </p>

      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {t.contact.label}
          </p>
        </div>

        <div className="md:col-span-6">
          <h2 className="contact-headline font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.03em] text-ink">
            {headlineLines.map((line, i) => (
              <span
                key={line}
                className={`line block ${i === 1 ? "pl-[clamp(2rem,10vw,8rem)] italic text-accent" : ""}`}
              >
                {line}
              </span>
            ))}
          </h2>
          <p className="contact-cta mt-10 max-w-[400px] text-[15px] leading-[1.7] text-muted">
            {t.contact.body}
          </p>
        </div>

        <div className="contact-cta flex flex-col justify-end gap-6 md:col-span-3 md:col-start-10">
          <Magnetic strength={0.2}>
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              data-cursor-label={t.contact.cursorLabel}
              className="group inline-flex items-center gap-4 text-[13px] uppercase tracking-[0.18em] text-ink"
            >
              <span className="h-px w-8 bg-accent transition-all duration-500 ease-out-expo group-hover:w-16" />
              <span className="transition-colors duration-300 group-hover:text-accent">
                {t.contact.cta}
              </span>
            </a>
          </Magnetic>

          <Magnetic strength={0.15}>
            <a
              href={links.email}
              data-cursor
              data-cursor-label="email"
              className="group text-[13px] tracking-[0.04em] text-muted transition-colors hover:text-accent"
            >
              <span className="block text-[11px] uppercase tracking-[0.18em]">
                {t.contact.email}
              </span>
              <span className="mt-1 block border-b border-transparent transition-colors group-hover:border-accent/40">
                {links.emailLabel}
              </span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
