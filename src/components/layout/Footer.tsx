"use client";

import { useLocale } from "@/context/LocaleContext";
import { ScrambleText } from "@/components/ui/ScrambleText";

export function Footer() {
  const { t, links } = useLocale();
  const year = new Date().getFullYear();

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socials = [
    links.telegram && { label: "Telegram", href: links.telegram },
    links.instagram && { label: "Instagram", href: links.instagram },
    links.soundcloud && { label: "SoundCloud", href: links.soundcloud },
    links.spotify && { label: "Spotify", href: links.spotify },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="relative overflow-hidden border-t border-ink/8">
      <div className="pointer-events-none px-5 pt-10 md:px-10">
        <p
          className="font-display text-[clamp(4rem,14vw,11rem)] leading-[0.85] tracking-[-0.04em] text-ink/[0.04] uppercase"
          aria-hidden
        >
          baneoff
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-8 md:flex-row md:items-end md:justify-between md:px-10 md:py-10">
        <div>
          <p className="font-display text-sm tracking-[0.08em] text-ink uppercase">
            {t.footer.handle}
          </p>
          <p className="mt-1 text-[12px] text-muted">{t.footer.name}</p>
          <p className="mt-1 text-[11px] tracking-[0.04em] text-muted/60">
            {t.footer.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label={social.label.toLowerCase()}
                className="text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
              >
                {social.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollTop}
            data-cursor
            data-cursor-label="↑"
            className="text-left text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent md:text-right"
          >
            <ScrambleText text={t.footer.backToTop} />
          </button>

          <p className="text-[11px] tracking-[0.06em] text-muted/60">
            © {year} — {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
