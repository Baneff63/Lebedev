import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
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
        <section className="border-t border-ink/8 px-5 py-16 text-center md:px-10 md:py-24">
          <Link
            href="/portfolio"
            data-cursor
            className="inline-flex items-center gap-3 rounded-full border border-ink bg-ink px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Смотреть портфолио
          </Link>
        </section>
        <Marquee reverse />
        <section className="border-t border-ink/8 px-5 py-16 text-center md:px-10 md:py-24">
          <Link
            href="/contact"
            data-cursor
            className="text-[12px] uppercase tracking-[0.16em] text-accent hover:underline"
          >
            Обсудить проект →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
