"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { PortfolioMarquee } from "./PortfolioMarquee";
import { PortfolioGrid } from "./PortfolioGrid";

type ViewMode = "flow" | "grid";

const LABELS: Record<"ru" | "en", { flow: string; grid: string }> = {
  ru: { flow: "Лента", grid: "Сетка" },
  en: { flow: "Flow", grid: "Grid" },
};

/**
 * Toggles between the two portfolio presentations:
 * - "flow" (default) — two endlessly auto-scrolling rows of every track,
 *   PortfolioMarquee.tsx. The "look how much work there is" view.
 * - "grid" — the original static, category-tabbed grid, PortfolioGrid.tsx,
 *   kept exactly as it was. One tap away for anyone who'd rather browse
 *   and filter by category than watch the ambient scroll.
 *
 * Category tabs only make sense in "grid" mode (the flow view intentionally
 * mixes every track together to feel bigger), so they live inside
 * PortfolioGrid itself rather than here.
 */
export function PortfolioView() {
  const [mode, setMode] = useState<ViewMode>("flow");
  const { locale } = useLocale();
  const labels = LABELS[locale];

  return (
    <div className="flex h-full flex-col overflow-x-hidden">
      <div className="flex shrink-0 justify-end">
        <div className="inline-flex rounded-full border border-ink/12 p-1" role="tablist">
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
              {labels[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        {mode === "flow" ? <PortfolioMarquee /> : <PortfolioGrid />}
      </div>
    </div>
  );
}
