"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { SmoothScroll } from "./SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Loader } from "@/components/ui/Loader";
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
      <CustomCursor />
      <div
        className="site-shell transition-opacity duration-300"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        {children}
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
