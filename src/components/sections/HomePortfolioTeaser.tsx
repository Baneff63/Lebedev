"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "@/lib/gsapScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { SectionNumber } from "@/components/effects/SectionNumber";

/**
 * Second chapter of the home scroll story: a teaser for /portfolio.
 * Reuses `t.work.label/headline/tabs/seeAll` — all already existing
 * content, same reasoning as HomeStats.tsx. Deliberately doesn't wire up
 * real tracks/audio here (that stays Portfolio's job) — these are just
 * three labeled category panels that drift horizontally as the section
 * scrolls through the viewport (a cheap `scrub` transform, not a
 * canvas/drag interaction, so — unlike the 3D tools carousel — there's no
 * need to disable it on mobile; it's inexpensive and still tracks native
 * scroll there too).
 */
export function HomePortfolioTeaser() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const tabs = [t.work.tabs.mixed, t.work.tabs.beats, t.work.tabs.personal];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".home-portfolio-intro .line", {
        scrollTrigger: { trigger: ".home-portfolio-intro", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
      });

      if (trackRef.current) {
        gsap.fromTo(
          trackRef.current,
          { xPercent: 6 },
          {
            xPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.work.headline.split("\n");

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-20 md:px-10 md:py-32"
    >
      <SectionNumber num="02" className="top-8 left-4 md:left-10" />

      <div className="home-portfolio-intro mx-auto w-full max-w-[1440px]">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{t.work.label}</p>
        <h2 className="mt-6 max-w-[640px] font-display text-[clamp(1.85rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em] text-ink">
          {headlineLines.map((line, i) => (
            <span key={line} className="line block overflow-hidden">
              <span className={i === headlineLines.length - 1 ? "italic text-accent" : ""}>
                {line}
              </span>
            </span>
          ))}
        </h2>
      </div>

      <div
        ref={trackRef}
        className="mt-16 flex w-max gap-5 will-change-transform md:mt-20"
      >
        {tabs.map((label, i) => (
          <Link
            key={label}
            href="/portfolio"
            data-cursor
            data-cursor-label="play"
            className="group flex h-[220px] w-[280px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 p-6 transition-colors hover:border-accent/50 sm:h-[260px] sm:w-[340px]"
            style={{ background: "linear-gradient(160deg, #211e1a 0%, #131110 100%)" }}
          >
            <span className="font-display text-3xl text-on-dark/30 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-2xl leading-tight text-on-dark transition-colors group-hover:text-accent">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-12 w-full max-w-[1440px]">
        <Link
          href="/portfolio"
          data-cursor
          className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-ink transition-colors hover:text-accent"
        >
          {t.work.seeAll}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
