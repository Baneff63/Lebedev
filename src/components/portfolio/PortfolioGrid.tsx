"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";

const EQ_BAR_COUNT = 16;

/**
 * Reverted to the original behavior: bars are STATIC (a fixed height set
 * once, no motion at all) whenever the track isn't playing, and only
 * animate via requestAnimationFrame while it actually is. The generative
 * cover + always-pulsing idle bars from the last couple of patches have
 * been removed — this file is back to exactly how it worked before those.
 */
function CardEqualizer({ playing, seed }: { playing: boolean; seed: number }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const idle = Array.from({ length: EQ_BAR_COUNT }, (_, i) =>
      0.12 + Math.abs(Math.sin(seed * 12.98 + i * 4.2)) * 0.28,
    );
    const targets = [...idle];
    const current = [...idle];

    if (!playing) {
      barsRef.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleY(${idle[i]})`;
      });
      return;
    }

    let raf = 0;
    const tick = () => {
      for (let i = 0; i < EQ_BAR_COUNT; i++) {
        if (Math.random() > 0.85) {
          const center = Math.abs(i - EQ_BAR_COUNT / 2) / (EQ_BAR_COUNT / 2);
          targets[i] = 0.2 + Math.random() * 0.8 * (1 - center * 0.35);
        }
        current[i] += (targets[i] - current[i]) * 0.25;
        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${current[i]})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, seed]);

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-5 pb-5" aria-hidden>
      {Array.from({ length: EQ_BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className={`w-full origin-bottom rounded-full transition-colors duration-300 ${
            playing ? "bg-accent" : "bg-on-dark/25"
          }`}
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

type PortfolioGridProps = {
  category: TrackCategory;
};

/**
 * Category tabs live one level up in PortfolioView.tsx (shared with the
 * flow/marquee view) — this component just receives the already-chosen
 * `category` and filters by it. Card cover is back to the original flat
 * dark gradient (the generative accent-glow background has been removed
 * per feedback — it read as outdated/off-brand, so this is reverted
 * rather than tweaked further).
 */
export function PortfolioGrid({ category }: PortfolioGridProps) {
  const { t } = useLocale();
  const { tracks, currentIndex, isPlaying, currentTime, duration, playTrack, toggle } =
    usePlayer();

  const filtered = useMemo(
    () => tracks.filter((tr) => trackCategory(tr) === category),
    [tracks, category],
  );

  const handleClick = (globalIndex: number) => {
    if (globalIndex === currentIndex) toggle();
    else playTrack(globalIndex);
  };

  return (
    <div className="flex h-full flex-col overflow-x-hidden">
      {/*
        IMPORTANT (bug fix, kept from before): this panel used to only set
        `overflow-y-auto`. TiltCard applies
        `perspective(...) rotateY() rotateX() scale(1.02)` on hover, which
        can make a card's rendered bounding box a fraction of a pixel wider
        than its layout box. With no `overflow-x` rule the browser
        defaults to `visible` for the x-axis even though y is `auto`, so
        that sub-pixel overflow was enough to spawn a horizontal scrollbar
        at the bottom of the panel on hover. `overflow-x-hidden` here (and
        one level up) removes it while leaving vertical scrolling intact.
      */}
      <div className="thin-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1 pb-2">
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-ink/12 text-center">
            <div>
              <p className="font-display text-xl italic text-muted">{t.work.emptyTitle}</p>
              <p className="mt-2 text-[13px] text-muted/70">{t.work.emptyBody}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((track: Track) => {
              const globalIndex = tracks.findIndex((tr) => tr.id === track.id);
              const active = globalIndex === currentIndex;
              const activePlaying = active && isPlaying;

              return (
                <TiltCard key={track.id} className="[transform:translateZ(0)]">
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors ${
                      active
                        ? "border-accent/50 bg-accent/[0.04]"
                        : "border-ink/10 hover:border-ink/25"
                    }`}
                  >
                    <div
                      className="relative flex h-28 items-center justify-center overflow-hidden"
                      style={{ background: "linear-gradient(160deg, #211e1a 0%, #131110 100%)" }}
                    >
                      <CardEqualizer playing={activePlaying} seed={globalIndex + 1} />
                      <button
                        type="button"
                        onClick={() => handleClick(globalIndex)}
                        data-cursor
                        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-on-dark/30 bg-paper/10 text-on-dark backdrop-blur-sm transition-transform hover:scale-105 hover:border-accent hover:bg-accent hover:text-paper"
                      >
                        {activePlaying ? "❙❙" : "▶"}
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p
                        className={`truncate font-display text-lg ${
                          active ? "text-accent" : "text-ink"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted">
                        {track.artist}
                        {track.genre ? ` · ${track.genre}` : ""}
                      </p>
                      <span className="mt-auto pt-2 text-[11px] tabular-nums text-muted">
                        {active ? `${formatTime(currentTime)} / ${formatTime(duration)}` : ""}
                      </span>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
