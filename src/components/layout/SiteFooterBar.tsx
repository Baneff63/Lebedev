"use client";

import { useLocale } from "@/context/LocaleContext";
import { usePlayer } from "@/context/PlayerContext";

/**
 * Slim fixed bar pinned to the bottom of every public page. Replaces the
 * old in-flow <Footer/> so pages never grow past 100dvh (no page scroll).
 *
 * When tracks exist, the <FixedPlayer/> already occupies the bottom of the
 * screen with the same kind of info (plus playback controls), so this bar
 * simply steps aside rather than stacking on top of it.
 */
export function SiteFooterBar() {
  const { t, links } = useLocale();
  const { tracks } = usePlayer();
  const year = new Date().getFullYear();

  if (tracks.length > 0) return null;

  const socials = [
    links.telegram && { label: "Telegram", href: links.telegram },
    links.instagram && { label: "Instagram", href: links.instagram },
    links.soundcloud && { label: "SoundCloud", href: links.soundcloud },
    links.spotify && { label: "Spotify", href: links.spotify },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="site-footer-bar fixed bottom-0 left-0 z-40 h-14 w-full border-t border-ink/8 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
        <p className="truncate text-[11px] tracking-[0.06em] text-muted/70">
          © {year} baneoff — {t.footer.tagline}
        </p>

        <div className="hidden items-center gap-5 sm:flex">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              data-cursor-label={social.label.toLowerCase()}
              className="text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
            >
              {social.label}
            </a>
          ))}
          <a
            href={links.email}
            data-cursor
            data-cursor-label="email"
            className="text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
          >
            {links.emailLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
