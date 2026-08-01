import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
import { HomeHero } from "@/components/sections/HomeHero";
import { Marquee } from "@/components/effects/Marquee";
import { GlobalEffects } from "@/components/effects/GlobalEffects";
import { FloatingBlob } from "@/components/effects/AudioVisualizer";
import { StudioHUD } from "@/components/effects/StudioHUD";
import { JsonLd } from "@/components/effects/JsonLd";

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
          <div className="flex flex-1 items-center px-5 md:px-10">
            <HomeHero />
          </div>
          <Marquee />
        </div>
      </main>

      <SiteFooterBar />
    </>
  );
}
