import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Contact } from "@/components/sections/Contact";
import { Marquee } from "@/components/effects/Marquee";
import { GlobalEffects } from "@/components/effects/GlobalEffects";
import { FloatingBlob } from "@/components/effects/AudioVisualizer";
import { StudioHUD } from "@/components/effects/StudioHUD";

export default function Home() {
  return (
    <>
      <GlobalEffects />
      <FloatingBlob />
      <StudioHUD />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Marquee reverse variant="accent" />
        <Marquee variant="outline" />
        <Work />
        <Marquee reverse />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
