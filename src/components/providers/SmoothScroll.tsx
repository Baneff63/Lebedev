"use client";

import type { ReactNode } from "react";

/**
 * The site no longer scrolls at the page level (each page is a fixed
 * 100dvh "app shell" — see .app-shell-main in globals.css), so Lenis'
 * document-level smooth-scroll has nothing left to manage. Keeping the
 * component (rather than removing it from Providers) means we can bring
 * smooth scrolling back for a specific page later just by re-enabling it
 * here, without touching the provider tree.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
