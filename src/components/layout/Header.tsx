"use client";

import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LiveClock } from "@/components/ui/LiveClock";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { useLocale } from "@/context/LocaleContext";

export function Header() {
  const { t } = useLocale();

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#philosophy", label: t.nav.philosophy },
    { href: "#work", label: t.nav.work },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
        <Magnetic strength={0.25}>
          <ScrambleText
            as="a"
            href="#"
            text="baneoff"
            dataCursor
            className="font-display text-sm tracking-[0.08em] text-ink uppercase"
          />
        </Magnetic>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <ScrambleText
              key={link.href}
              as="a"
              href={link.href}
              text={link.label}
              dataCursor
              className="nav-link text-[11px] uppercase tracking-[0.18em] text-muted"
            />
          ))}
        </nav>

        <div className="flex items-center gap-5 md:gap-6">
          <LiveClock />
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
