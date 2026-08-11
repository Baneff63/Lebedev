import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/sections/HomeHero";
import { Marquee } from "@/components/effects/Marquee";
import { GlobalEffects, ScrollProgress } from "@/components/effects/GlobalEffects";
import { FloatingBlob } from "@/components/effects/AudioVisualizer";
import { StudioHUD } from "@/components/effects/StudioHUD";
import { JsonLd } from "@/components/effects/JsonLd";
import { SignalScope } from "@/components/effects/SignalScope";
import { HomeSignalScopeController } from "@/components/effects/HomeSignalScopeController";
import { HomeStats } from "@/components/sections/HomeStats";
import { HomePortfolioTeaser } from "@/components/sections/HomePortfolioTeaser";
import { HomeFinale } from "@/components/sections/HomeFinale";

/**
 * The only page in the app that actually scrolls at the document level —
 * every other route stays the fixed, no-scroll "app shell" (see
 * .app-shell-main in globals.css). That split is intentional, not a
 * half-finished migration: Portfolio/Contact/Blog's internal panels,
 * GlobalSignalScope's per-route slot measurements, and the fixed footer
 * bar all assume a fixed 100dvh page there, and none of that changes.
 *
 * Home instead uses `.app-shell-main--scroll` (see globals.css), which
 * drops the fixed height/overflow so the browser's native scroll takes
 * over for hero → stats → portfolio teaser → finale. `SiteFooterBar`
 * isn't rendered here — HomeFinale's own footer-style block at the
 * bottom replaces it.
 */
export default function Home() {
  return (
    <>
      <JsonLd />
      <GlobalEffects />
      <FloatingBlob />
      <StudioHUD />
      {/* Thin top progress bar — only meaningful (and only mounted) on a
          page that actually has document scroll. */}
      <ScrollProgress />
      {/* No visual output — just tells GlobalSignalScope to follow the
          scroll live instead of only flying once per route change. */}
      <HomeSignalScopeController />
      <Header />

      <main className="app-shell-main app-shell-main--scroll pt-20 md:pt-24">
        <div className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]">
          <div className="flex flex-1 items-stretch px-5 md:px-10">
            <div className="relative mx-auto flex w-full max-w-[1440px] items-center">
              {/* Fills the empty right-hand real estate on wide desktop
                  screens — intentionally `hidden` below `lg`: it's not
                  just visually hidden there, `SignalScope` itself also
                  measures 0×0 through a ResizeObserver whenever its box
                  collapses (exactly what `display: none` does to it) and
                  skips its animation loop entirely in that case, so
                  there's no wasted rendering work on mobile either. */}
              <div className="pointer-events-none absolute inset-y-6 right-0 hidden w-[36%] lg:block">
                <SignalScope />
              </div>

              <HomeHero />
            </div>
          </div>
          <Marquee />
        </div>

        <HomeStats />
        <HomePortfolioTeaser />
        <HomeFinale />
      </main>
    </>
  );
}
