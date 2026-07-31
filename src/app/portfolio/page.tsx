import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

export const metadata: Metadata = { title: "Портфолио" };

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="px-5 pt-32 pb-20 md:px-10 md:pt-40 md:pb-32">
        <section className="relative mx-auto w-full max-w-[1440px]">
          <SectionNumber num="02" className="top-0 right-4 md:right-10" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Портфолио</p>
          <h1 className="mt-6 max-w-[720px] font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
            Сведено, биты и личные работы —
            <span className="italic text-accent"> всё в одном месте.</span>
          </h1>
          <div className="mt-16">
            <PortfolioGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
