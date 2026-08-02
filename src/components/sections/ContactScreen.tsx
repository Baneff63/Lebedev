"use client";

import { useState, type ReactElement } from "react";
import { useLocale } from "@/context/LocaleContext";
import { ToolsStack } from "@/components/effects/ToolsStack";
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

export function ContactScreen() {
  const { t, links, siteData } = useLocale();
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const headlineLines = t.contact.headline.split("\n");
  const tools = siteData?.toolsStack ?? [];

  const socials = [
    links.telegram && { key: "telegram", label: "Telegram", href: links.telegram, icon: <IconTelegram /> },
    links.instagram && { key: "instagram", label: "Instagram", href: links.instagram, icon: <IconInstagram /> },
    links.soundcloud && { key: "soundcloud", label: "SoundCloud", href: links.soundcloud, icon: <IconSoundcloud /> },
    links.spotify && { key: "spotify", label: "Spotify", href: links.spotify, icon: <IconSpotify /> },
  ].filter(Boolean) as { key: string; label: string; href: string; icon: ReactElement }[];

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[1500px] flex-col px-5 md:px-10">
      <div className="shrink-0 pt-6 md:pt-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{t.contact.label}</p>
      </div>

      <div className="grid flex-1 grid-cols-1 items-center gap-8 py-4 md:grid-cols-[260px_1fr_260px] md:items-stretch md:gap-6">
        {/* Left — the pitch + primary ways to reach out */}
        <div className="md:flex md:flex-col md:justify-center">
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            {headlineLines.map((line, i) => (
              <span key={line} className={`block ${i === 1 ? "italic text-accent" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-[360px] text-[14px] leading-[1.7] text-muted">
            {t.contact.body}
          </p>

          <div className="mt-7">
            <Magnetic strength={0.2}>
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label={t.contact.cursorLabel}
                className="inline-flex items-center gap-3 rounded-full border border-ink bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
              >
                <IconTelegram />
                {t.contact.cta}
              </a>
            </Magnetic>
            <p className="mt-3 text-[11px] tracking-[0.08em] text-muted/70">{t.contact.ctaSub}</p>
          </div>

          <a
            href={links.email}
            data-cursor
            data-cursor-label="email"
            className="group mt-6 block text-[13px] tracking-[0.04em] text-muted transition-colors hover:text-accent"
          >
            <span className="block text-[11px] uppercase tracking-[0.18em]">{t.contact.email}</span>
            <span className="mt-1 block border-b border-transparent transition-colors group-hover:border-accent/40">
              {links.emailLabel}
            </span>
          </a>

          <button
            type="button"
            onClick={() => setShowAnalyzer(true)}
            data-cursor
            className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
          >
            {t.contact.analyzer.title} →
          </button>
        </div>

        {/* Center — the interactive 3D tools carousel, given real room to breathe */}
        <div className="flex flex-col items-center">
          <p className="mb-2 shrink-0 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
            {t.contactPage.toolsLabel}
          </p>
          <div className="w-full py-2 md:h-[360px] md:min-h-0 md:flex-1 md:py-0">
            <ToolsStack tools={tools} />
          </div>
        </div>

        {/* Right — socials */}
        <div className="md:flex md:flex-col md:justify-center md:items-end">
          {socials.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted/70 md:text-right">
                {t.contact.socialsLabel}
              </p>
              <div className="mt-4 flex flex-col gap-3 md:items-end">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    data-cursor-label={social.label.toLowerCase()}
                    className="flex items-center gap-3 text-[13px] text-ink/80 transition-colors hover:text-accent"
                  >
                    {social.icon}
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BPM/key analyzer lives in an on-demand overlay so the base screen
          never has to scroll to accommodate it. */}
      {showAnalyzer && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-5 backdrop-blur-sm"
          onClick={() => setShowAnalyzer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="thin-scrollbar max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-paper p-2 shadow-[var(--shadow-card)]"
          >
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setShowAnalyzer(false)}
                data-cursor
                className="text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
              >
                ✕ Закрыть
              </button>
            </div>
            <div className="pb-4">
              <TrackAnalyzer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
