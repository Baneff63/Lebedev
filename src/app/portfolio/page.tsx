import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
import { PortfolioBackdrop } from "@/components/effects/PortfolioBackdrop";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = { title: "Портфолио" };

export default function PortfolioPage() {
  return (
    <>
      <Header />

      <main className="app-shell-main relative h-dvh overflow-hidden pt-20 md:pt-24">
        <PortfolioBackdrop />

        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 md:px-10">
          <div className="shrink-0 pt-6 md:pt-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Портфолио</p>
            <h1 className="mt-4 max-w-[720px] font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              Сведено, биты и личные работы —
              <span className="italic text-accent"> всё в одном месте.</span>
            </h1>
          </div>

          {/* Only this panel scrolls/animates (when there are more tracks
              than fit, or in the flow view, always) — the page itself
              stays fixed at 100dvh. PortfolioView owns the flow/grid
              toggle and renders whichever is currently selected. */}
          <div className="mt-8 min-h-0 flex-1 pb-4">
            <PortfolioView />
          </div>
        </div>
      </main>

      <SiteFooterBar />
    </>
  );
}
