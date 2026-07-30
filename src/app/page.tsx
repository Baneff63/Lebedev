import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Portfolio } from "@/components/sections/Portfolio";
import { Contact } from "@/components/sections/Contact";
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
      <main>
        <Hero />
        <Marquee />
        <About />
        <Portfolio />
        <Marquee reverse />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
