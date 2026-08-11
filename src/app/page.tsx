import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
import { HomeHero } from "@/components/sections/HomeHero";
import { Marquee } from "@/components/effects/Marquee";
import { GlobalEffects } from "@/components/effects/GlobalEffects";
import { FloatingBlob } from "@/components/effects/AudioVisualizer";
import { StudioHUD } from "@/components/effects/StudioHUD";
import { JsonLd } from "@/components/effects/JsonLd";
import { SignalScope } from "@/components/effects/SignalScope";

export default function Home() {
  return (
    <>
      <JsonLd />
      <GlobalEffects />
      <FloatingBlob />
      <StudioHUD />
      <Header />

      {/* Everything lives above the fold: header (fixed) + this single
          100dvh main + the fixed footer bar. No page-level scrolling. */}
      <main className="app-shell-main h-dvh overflow-hidden pt-20 md:pt-24">
        <div className="flex h-full flex-col">
          {/*
            `items-stretch` (the flex default, made explicit here) instead
            of the old `items-center`: the inner `max-w-[1440px]` column
            below now needs to stretch to the *full* available height so
            SignalScope — positioned absolute inside it — can size itself
            against the real empty area to the right of the hero copy,
            not just against HomeHero's own (much shorter) content box.
            HomeHero itself is still vertically centered as before, via
            `items-center` on that inner flex row.
          */}
          <div className="flex flex-1 items-stretch px-5 md:px-10">
            <div className="relative mx-auto flex w-full max-w-[1440px] items-center">
              {/* Fills the empty right-hand real estate on wide desktop
                  screens — intentionally `hidden` below `lg`: it's not
                  just visually hidden there, `SignalScope` itself also
                  measures 0×0 through a ResizeObserver whenever its box
                  collapses (exactly what `display: none` does to it) and
                  skips its animation loop entirely in that case, so
                  there's no wasted rendering work on mobile either.
                  Rendered before `HomeHero` so the hero's own text (the
                  "trust" column on the right, in particular) always
                  paints on top of it rather than the other way around. */}
              <div className="pointer-events-none absolute inset-y-6 right-0 hidden w-[36%] lg:block">
                <SignalScope />
              </div>

              <HomeHero />
            </div>
          </div>
          <Marquee />
        </div>
      </main>

      <SiteFooterBar />
    </>
  );
}
