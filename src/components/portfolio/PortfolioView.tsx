"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { PortfolioMarquee } from "./PortfolioMarquee";
import { PortfolioGrid } from "./PortfolioGrid";
import type { TrackCategory } from "@/types/site";

type ViewMode = "flow" | "grid";

const VIEW_LABELS: Record<"ru" | "en", { flow: string; grid: string }> = {
  ru: { flow: "Лента", grid: "Сетка" },
  en: { flow: "Flow", grid: "Grid" },
};

/**
 * Owns the two controls shared by both portfolio presentations:
 * - the category tabs (Сведено / Биты / Личные работы) — these used to
 *   live inside PortfolioGrid only; they're lifted up here so they also
 *   apply to the flow view, instead of the flow view always mixing every
 *   category together.
 * - the flow/grid toggle itself.
 *
 * - "flow" (default) — two endlessly auto-scrolling rows,
 *   PortfolioMarquee.tsx.
 * - "grid" — the original static grid, PortfolioGrid.tsx.
 *
 * Both child views receive the same `category` and filter by it
 * independently, so switching modes never loses the current filter.
 */
export function PortfolioView() {
  const [mode, setMode] = useState<ViewMode>("flow");
  const [category, setCategory] = useState<TrackCategory>("mixed");
  const { t, locale } = useLocale();
  const viewLabels = VIEW_LABELS[locale];

  const tabs: { id: TrackCategory; label: string }[] = [
    { id: "mixed", label: t.work.tabs.mixed },
    { id: "beats", label: t.work.tabs.beats },
    { id: "personal", label: t.work.tabs.personal },
  ];

  return (
    <div className="flex h-full flex-col overflow-x-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              data-cursor
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                category === tab.id
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/15 text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inline-flex shrink-0 rounded-full border border-ink/12 p-1" role="tablist">
          {(["flow", "grid"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              data-cursor
              className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                mode === id ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              {viewLabels[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        {mode === "flow" ? (
          <PortfolioMarquee category={category} />
        ) : (
          <PortfolioGrid category={category} />
        )}
      </div>
    </div>
  );
}
