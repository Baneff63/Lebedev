"use client";

import { useApp } from "@/context/LocaleContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-cursor
      data-cursor-label={theme === "light" ? "dark" : "light"}
      className="group relative text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className={theme === "light" ? "text-ink" : "text-muted"}>Lt</span>
      <span className="mx-1.5 text-muted/40">/</span>
      <span className={theme === "dark" ? "text-ink" : "text-muted"}>Dk</span>
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-out-expo group-hover:w-full" />
    </button>
  );
}
