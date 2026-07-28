"use client";

import { useLocale } from "@/context/LocaleContext";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      data-cursor
      className="group relative text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
      aria-label={locale === "ru" ? "Switch to English" : "Переключить на русский"}
    >
      <span className={locale === "ru" ? "text-ink" : "text-muted"}>Ru</span>
      <span className="mx-1.5 text-muted/40">/</span>
      <span className={locale === "en" ? "text-ink" : "text-muted"}>En</span>
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-out-expo group-hover:w-full" />
    </button>
  );
}
