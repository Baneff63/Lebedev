"use client";

/**
 * Positioning marker only — the actual drawing now happens in a single
 * persistent canvas (GlobalSignalScope.tsx, mounted once at the app-shell
 * level in Providers.tsx) so the scope can smoothly fly between pages
 * instead of being torn down and recreated on every navigation.
 *
 * This component just marks WHERE that floating canvas should sit while
 * this particular page is showing — give it a sized/positioned wrapper
 * (see how the home page and the portfolio page use it) and it fills
 * that box with an invisible `data-signal-scope-slot` marker.
 *
 * Previously this same file held its own canvas, resize observer, tilt
 * tracking, and HUD readout — all of that moved to GlobalSignalScope.tsx
 * so there's exactly one drawing loop for the whole app rather than a
 * fresh, unrelated one per page.
 */
export function SignalScope({ className = "" }: { className?: string }) {
  return (
    <div
      data-signal-scope-slot=""
      className={`pointer-events-none h-full w-full ${className}`}
      aria-hidden
    />
  );
}
