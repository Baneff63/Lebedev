"use client";

import { useEffect, useRef, type ReactElement } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "@/lib/gsapScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Magnetic } from "@/components/ui/Magnetic";

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

/**
 * Final "chapter" of the home scroll story — reuses `t.contact.*`
 * copy (same source ContactScreen.tsx already draws from). Two things
 * this section deliberately does NOT do, per explicit direction:
 * - It never auto-navigates anywhere. The link to /contact is a plain
 *   `<Link>` the user has to click — scroll-jacking a route change is a
 *   reliability/accessibility trap (breaks trackpad inertia, back
 *   button, keyboard nav), not an award-site technique.
 * - It doesn't add any new CMS/i18n fields, to avoid breaking on a
 *   Vercel Blob site-data.json that predates this change (see
 *   HomeStats.tsx for the full reasoning).
 */
export function HomeFinale() {
  const { t, links } = useLocale();
  const year = new Date().getFullYear();
  const sectionRef = useRef<HTMLElement>(null);
  const slotWrapRef = useRef<HTMLDivElement>(null);

  const socials = [
    links.telegram && { key: "telegram", label: "Telegram", href: links.telegram, icon: <IconTelegram /> },
    links.instagram && { key: "instagram", label: "Instagram", href: links.instagram, icon: <IconInstagram /> },
    links.soundcloud && { key: "soundcloud", label: "SoundCloud", href: links.soundcloud, icon: <IconSoundcloud /> },
    links.spotify && { key: "spotify", label: "Spotify", href: links.spotify, icon: <IconSpotify /> },
  ].filter(Boolean) as { key: string; label: string; href: string; icon: ReactElement }[];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".home-finale-label", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".home-finale-headline .line", {
        scrollTrigger: { trigger: ".home-finale-headline", start: "top 82%" },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".home-mail-link", {
        scrollTrigger: { trigger: ".home-mail-link", start: "top 85%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.from(".home-finale-social", {
        scrollTrigger: { trigger: ".home-finale-socials", start: "top 90%" },
        y: 14,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      });

      // Grows the finale signal-scope slot in as the section arrives —
      // scaling the slot element's own box (not a canvas trick): since
      // GlobalSignalScope's live-scroll mode re-measures whichever slot
      // is on screen every frame via getBoundingClientRect() — which
      // already accounts for CSS transforms — the canvas simply grows to
      // match, with zero extra plumbing on the scope's side.
      if (slotWrapRef.current) {
        gsap.fromTo(
          slotWrapRef.current,
          { scale: 0.55, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              end: "top 20%",
              scrub: 0.6,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  const headlineLines = t.contact.headline.split("\n");

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 pt-20 pb-24 md:px-10 md:pt-32 md:pb-32"
    >
      {/* Finale signal-scope slot — see the scrollTrigger tween above. */}
      <div
        ref={slotWrapRef}
        className="pointer-events-none absolute top-[4%] right-[2%] hidden h-[46%] w-[46%] origin-top-right will-change-transform lg:block"
      >
        <div data-signal-scope-slot="" className="h-full w-full" aria-hidden />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px]">
        <p className="home-finale-label text-[11px] uppercase tracking-[0.22em] text-muted">
          {t.contact.label}
        </p>

        <h2 className="home-finale-headline mt-6 max-w-[760px] font-display text-[clamp(2rem,5.5vw,4.25rem)] leading-[1.05] tracking-[-0.03em] text-ink">
          {headlineLines.map((line, i) => (
            <span
              key={line}
              className={`line block overflow-hidden ${i === 1 ? "italic text-accent" : ""}`}
            >
              {line}
            </span>
          ))}
        </h2>

        <p className="mt-14 text-[11px] uppercase tracking-[0.2em] text-muted">
          {t.contact.email}
        </p>
        <Magnetic strength={0.08} className="mt-3 inline-block">
          <a
            href={links.email}
            data-cursor
            data-cursor-label="email"
            className="home-mail-link inline-block text-ink"
          >
            {links.emailLabel}
            <span className="mail-underline" aria-hidden />
          </a>
        </Magnetic>

        <div className="mt-16 flex flex-col gap-8 border-t border-ink/8 pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm tracking-[0.08em] text-ink uppercase">
              {t.footer.handle}
            </p>
            <p className="mt-1 text-[12px] text-muted">{t.footer.name}</p>
            <p className="mt-1 text-[11px] tracking-[0.04em] text-muted/60">
              © {year} — {t.footer.rights}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            {socials.length > 0 && (
              <div className="home-finale-socials flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    data-cursor-label={social.label.toLowerCase()}
                    className="home-finale-social flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
                  >
                    {social.icon}
                    {social.label}
                  </a>
                ))}
              </div>
            )}

            {/* Plain link, not an auto-scroll — see the note in the
                component doc-comment above for why. */}
            <Link
              href="/contact"
              data-cursor
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-accent"
            >
              <ScrambleText text={t.nav.contact} />
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
