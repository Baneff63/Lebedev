"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LiveClock } from "@/components/ui/LiveClock";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { useLocale } from "@/context/LocaleContext";

export function Header() {
  const { t } = useLocale();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.nav.about },
    { href: "/portfolio", label: t.nav.work },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
        <Magnetic strength={0.25}>
          <Link href="/" data-cursor>
            <ScrambleText
              text="baneoff"
              className="font-display text-sm tracking-[0.08em] text-ink uppercase"
            />
          </Link>
        </Magnetic>

        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-5 md:gap-6">
          <LiveClock />
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
