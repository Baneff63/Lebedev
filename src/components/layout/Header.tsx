"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LiveClock } from "@/components/ui/LiveClock";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { useLocale } from "@/context/LocaleContext";

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <line
        x1="3"
        y1={open ? 10 : 6}
        x2="17"
        y2={open ? 10 : 6}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{
          transformOrigin: "10px 10px",
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 0.35s var(--ease-out-expo), y 0.35s var(--ease-out-expo)",
        }}
      />
      <line
        x1="3"
        y1="10"
        x2="17"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{
          transition: "opacity 0.25s var(--ease-out-expo)",
          opacity: open ? 0 : 1,
        }}
      />
      <line
        x1="3"
        y1={open ? 10 : 14}
        x2="17"
        y2={open ? 10 : 14}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{
          transformOrigin: "10px 10px",
          transform: open ? "rotate(-45deg)" : "none",
          transition: "transform 0.35s var(--ease-out-expo), y 0.35s var(--ease-out-expo)",
        }}
      />
    </svg>
  );
}

export function Header() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.about },
    { href: "/portfolio", label: t.nav.work },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open, and allow Escape to close it.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 z-50 h-16 w-full [padding-top:env(safe-area-inset-top)] md:h-24">
      <div className="mx-auto grid h-16 w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:h-24 md:px-10">
        <div className="justify-self-start">
          <Magnetic strength={0.25}>
            <Link href="/" data-cursor>
              <ScrambleText
                text="baneoff"
                className="font-display text-sm tracking-[0.08em] text-ink uppercase"
              />
            </Link>
          </Magnetic>
        </div>

        {/* Centered as its own grid column, so it's truly centered
            regardless of how wide the logo or the right-hand controls are. */}
        <nav className="hidden items-center gap-8 justify-self-center md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor
              className={`nav-link text-[11px] uppercase tracking-[0.18em] transition-colors ${
                pathname === link.href ? "text-ink" : "text-muted"
              }`}
            >
              <ScrambleText text={link.label} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-4 md:gap-6">
          <LiveClock />
          <div className="hidden items-center gap-5 md:flex">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center text-ink md:hidden"
          >
            <IconMenu open={open} />
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <div
        className={`mobile-nav fixed inset-0 z-40 flex flex-col bg-paper transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex-1 [padding-top:calc(env(safe-area-inset-top)+4rem)]" />
        <nav className="flex flex-col gap-1 px-6 pb-4">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor
              className={`mobile-nav-link border-b border-ink/8 py-4 font-display text-[clamp(1.6rem,7vw,2.4rem)] leading-none tracking-[-0.01em] transition-colors ${
                pathname === link.href ? "text-accent italic" : "text-ink"
              }`}
              style={{
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                transform: open ? "translateY(0)" : "translateY(12px)",
                opacity: open ? 1 : 0,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
