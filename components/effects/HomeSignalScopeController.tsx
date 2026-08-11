"use client";

import { useEffect } from "react";
import { setSignalScopeLiveMode } from "@/lib/signalScopeScrollMode";

/**
 * Renders nothing — just marks the home page as GlobalSignalScope's
 * "scroll story" for as long as it's mounted. Mounted only from
 * `src/app/page.tsx`, so on every other route this stays off and
 * GlobalSignalScope behaves exactly as before (one fly-tween per route
 * change, driven by `[data-signal-scope-slot]`).
 */
export function HomeSignalScopeController() {
  useEffect(() => {
    setSignalScopeLiveMode(true);
    return () => setSignalScopeLiveMode(false);
  }, []);

  return null;
}
