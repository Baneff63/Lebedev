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
        BUG FIX: this used to be hidden via `opacity: isLoaded ? 1 : 0` with
        a 300ms fade-in — a leftover defensive measure from when the Loader
        might not have painted yet. It's redundant: `<Loader/>`'s own
        overlay is `fixed inset-0 z-[10000]` with an opaque background,
        rendered in the same server-rendered markup, so it already fully
        covers this real page with zero JS required — nothing was ever at
        risk of flashing through.
        Worse, that opacity gate is what caused a real visual bug: the
        Loader's exit animation hands off into the real, already-mounted
        `SignalScope` on the homepage hero by shrinking an iris exactly
        around it — but with this div sitting at `opacity: 0` the whole
        time, there was nothing for that iris to reveal. The shape the
        Loader drew would vanish, and only ~300ms later (once this opacity
        transition ran) would the real page — and the real SignalScope —
        actually fade into view. That gap read as "the shape disappears,
        then reappears". Rendering this at full opacity from the start
        (still fully hidden underneath the Loader) makes the handoff truly
        seamless: whatever is revealed by the shrinking iris is already
        there, mid-animation, matching what the Loader was just drawing.
      */}
      <div className="site-shell isolate">
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
