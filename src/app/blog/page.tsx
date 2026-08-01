import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
import { BlogBackdrop } from "@/components/effects/BlogBackdrop";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = { title: "Блог" };

export default function BlogPage() {
  return (
    <>
      <Header />

      <main className="app-shell-main relative h-dvh overflow-hidden pt-20 md:pt-24">
        <BlogBackdrop />

        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 md:px-10">
          <div className="shrink-0 pt-6 md:pt-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Блог</p>
            <h1 className="mt-4 max-w-[600px] font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              Заметки из студии —
              <span className="italic text-accent"> без воды.</span>
            </h1>
          </div>

          <div className="mt-8 min-h-0 flex-1 pb-4">
            <BlogList />
          </div>
        </div>
      </main>

      <SiteFooterBar />
    </>
  );
}
