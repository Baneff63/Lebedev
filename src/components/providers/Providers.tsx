"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { SmoothScroll } from "./SmoothScroll";
import { PageTransition } from "./PageTransition";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Loader } from "@/components/ui/Loader";
import { StartupSound } from "@/components/effects/StartupSound";
import { FixedPlayer } from "@/components/player/FixedPlayer";
import { GlobalSignalScope } from "@/components/effects/GlobalSignalScope";

function PlayerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { tracks } = useLocale();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <PlayerProvider tracks={tracks}>
      {children}
      <FixedPlayer />
    </PlayerProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoaded } = useLocale();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {!isLoaded && <Loader />}
      {/* Проигрывает звук "запуска студии" один раз, сразу после того как
          Loader вызовет setLoaded(true). См. StartupSound.tsx. */}
      <StartupSound />
      <CustomCursor />
      {/*
        BUG FIX (kept from before): this used to be hidden via
        `opacity: isLoaded ? 1 : 0` with a 300ms fade-in — a leftover
        defensive measure from when the Loader might not have painted
        yet. It's redundant: `<Loader/>`'s own overlay is
        `fixed inset-0 z-[10000]` with an opaque background, rendered in
        the same server-rendered markup, so it already fully covers this
        real page with zero JS required — nothing was ever at risk of
        flashing through. Rendering this at full opacity from the start
        (still fully hidden underneath the Loader) is what makes the
        Loader's handoff into the real page seamless.
      */}
      <div className="site-shell isolate">
        {/*
          GlobalSignalScope is mounted here — inside this same isolated
          `site-shell` stacking context as the routed page — so its
          negative z-index correctly keeps it *behind* every page's real
          content (text, cards, buttons) without any risk of it escaping
          past this wrapper and ending up hidden behind unrelated opaque
          siblings elsewhere (see AmbientEqualizerField.tsx for the full
          story on that exact class of bug, fixed the same way there).
          It's a single persistent canvas for the whole app (see
          GlobalSignalScope.tsx) — it survives every client-side
          navigation underneath PageTransition's curtain, flying between
          whichever page currently has a `data-signal-scope-slot` marker.
        */}
        <GlobalSignalScope />
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SmoothScroll>
        <PlayerShell>
          <AppShell>{children}</AppShell>
        </PlayerShell>
      </SmoothScroll>
    </LocaleProvider>
  );
}
