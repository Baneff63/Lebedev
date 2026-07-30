"use client";

import { useEffect, useRef, type ReactElement } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { Magnetic } from "@/components/ui/Magnetic";
import { TrackAnalyzer } from "./TrackAnalyzer";

function IconTelegram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.3 3.6 2.7 11.3c-1.3.5-1.3 1.3-.2 1.6l5 1.6 1.9 5.9c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.7 3.5c.8.5 1.5.2 1.7-.8L23.9 4.9c.3-1.3-.5-1.9-1.6-1.3ZM8.5 14.3l10-6.3c.5-.3.9-.1.6.2L10 15c-.1 0-.2 0-.3-.1l-1.2-.6Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.3-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.3-.4 1.3-.1 1.7-.1 4.9-.1M12 0C8.7 0 8.3 0 7 .1c-1.3 0-2.2.2-3 .5-.8.3-1.5.7-2.2 1.4C1.1 2.7.7 3.4.4 4.2c-.3.8-.5 1.7-.5 3C0 8.7 0 9.1 0 12.4s0 3.7.1 5c0 1.3.2 2.2.5 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .5 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3 0 2.2-.2 3-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.5-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c0-1.3-.2-2.2-.5-3-.3-.8-.7-1.5-1.4-2.2C21.3 1.1 20.6.7 19.8.4c-.8-.3-1.7-.5-3-.5C15.7 0 15.3 0 12 0Z" />
      <path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="18.4" cy="5.6" r="1.4" />
    </svg>
  );
}

function IconSoundcloud() {
  return (
    <svg width="17" height="14" viewBox="0 0 32 24" fill="currentColor" aria-hidden>
      <path d="M8 24h16.5c3 0 5.5-2.4 5.5-5.4 0-3-2.5-5.4-5.5-5.4-.5 0-1 .1-1.4.2C22.5 9.6 19.6 7 16 7c-1 0-1.9.2-2.7.6-.4.2-.5.4-.5.8v14.8c0 .5.4.8.8.8H8Z" />
    </svg>
  );
}

function IconSpotify() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.58-1.04 8.5-.6 11.66 1.34.36.22.47.68.25 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 1 1-.55-1.8c4.36-1.32 9.78-.68 13.5 1.6.44.27.58.85.31 1.29Zm.13-3.4C15.98 8.4 9.9 8.2 6.36 9.28a1.13 1.13 0 1 1-.66-2.16c4.06-1.23 10.8-1 15.06 1.55a1.13 1.13 0 1 1-1.16 1.94Z" />
    </svg>
  );
}

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

      gsap.from(".contact-social", {
        scrollTrigger: { trigger: ".contact-socials", start: "top 88%" },
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      });

      gsap.from(".analyzer-card", {
        scrollTrigger: { trigger: ".analyzer-card", start: "top 85%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.contact.headline.split("\n");

  const socials = [
    links.telegram && { key: "telegram", label: "Telegram", href: links.telegram, icon: <IconTelegram /> },
    links.instagram && { key: "instagram", label: "Instagram", href: links.instagram, icon: <IconInstagram /> },
    links.soundcloud && { key: "soundcloud", label: "SoundCloud", href: links.soundcloud, icon: <IconSoundcloud /> },
    links.spotify && { key: "spotify", label: "Spotify", href: links.spotify, icon: <IconSpotify /> },
  ].filter(Boolean) as { key: string; label: string; href: string; icon: ReactElement }[];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-20 md:px-10 md:py-32"
    >
      <SectionNumber num="03" className="bottom-4 left-1/2 -translate-x-1/2" />

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
          <h2 className="contact-headline font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1] tracking-[-0.03em] text-ink">
            {headlineLines.map((line, i) => (
              <span key={line} className={`line block ${i === 1 ? "italic text-accent" : ""}`}>
                {line}
              </span>
            ))}
          </h2>
          <p className="contact-cta mt-8 max-w-[400px] text-[15px] leading-[1.7] text-muted">
            {t.contact.body}
          </p>
        </div>

        <div className="contact-cta flex flex-col justify-end gap-8 md:col-span-3 md:col-start-10">
          <div>
            <Magnetic strength={0.2}>
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label={t.contact.cursorLabel}
                className="group inline-flex items-center gap-3 rounded-full border border-ink bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
              >
                <IconTelegram />
                {t.contact.cta}
              </a>
            </Magnetic>
            <p className="mt-3 text-[11px] tracking-[0.08em] text-muted/70">{t.contact.ctaSub}</p>
          </div>

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

          {socials.length > 0 && (
            <div className="contact-socials">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted/70">
                {t.contact.socialsLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    data-cursor-label={social.label.toLowerCase()}
                    aria-label={social.label}
                    className="contact-social flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-accent hover:text-accent"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto mt-20 w-full max-w-[1440px] border-t border-ink/8 pt-16 md:mt-28 md:pt-20">
        <TrackAnalyzer />
      </div>
    </section>
  );
}
