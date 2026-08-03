"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";

const EQ_BAR_COUNT = 16;

/**
 * Real equalizer:
 * - Not playing: deterministic "idle" heights per card (seeded), static.
 * - Playing + this card is the active one: driven by the real
 *   AnalyserNode frequency data of the currently playing track.
 * - Playing + not active (shouldn't really happen, safety net only):
 *   falls back to a pseudo-random animation.
 */
function CardEqualizer({
  playing,
  seed,
  active,
}: {
  playing: boolean;
  seed: number;
  active: boolean;
}) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);
  const { getAnalyser } = usePlayer();

  const idleHeights = useMemo(
    () =>
      Array.from({ length: EQ_BAR_COUNT }, (_, i) => {
        const v = Math.abs(Math.sin(seed * 12.9898 + i * 4.233));
        return 0.12 + v * 0.28;
      }),
    [seed],
  );

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (!playing) {
      barsRef.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleY(${idleHeights[i]})`;
      });
      return;
    }

    const analyser = active ? getAnalyser() : null;
    const current = [...idleHeights];

    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      const usableBins = Math.max(1, Math.floor(analyser.frequencyBinCount * 0.6));

      const tick = () => {
        analyser.getByteFrequencyData(data);
        for (let i = 0; i < EQ_BAR_COUNT; i++) {
          const bin = Math.min(
            usableBins - 1,
            Math.floor(Math.pow(i / EQ_BAR_COUNT, 1.6) * usableBins),
          );
          const raw = data[bin] / 255;
          const target = Math.min(1, 0.08 + raw * 1.15);
          current[i] += (target - current[i]) * 0.35;
          const el = barsRef.current[i];
          if (el) el.style.transform = `scaleY(${current[i]})`;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }

    // Fallback: analyser not ready yet — old pseudo-random animation so
    // there's no visible flash of a static bar.
    const targets = [...idleHeights];
    const tick = () => {
      for (let i = 0; i < EQ_BAR_COUNT; i++) {
        if (Math.random() > 0.8) {
          const center = Math.abs(i - EQ_BAR_COUNT / 2) / (EQ_BAR_COUNT / 2);
          targets[i] = 0.2 + Math.random() * 0.8 * (1 - center * 0.35);
        }
        current[i] += (targets[i] - current[i]) * 0.25;
        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${current[i]})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, active, idleHeights, getAnalyser]);

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-5 pb-5" aria-hidden>
      {idleHeights.map((h, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className={`w-full origin-bottom rounded-full transition-colors duration-300 ${
            playing ? "bg-accent" : "bg-on-dark/25"
          }`}
          style={{ height: "100%", transform: `scaleY(${h})` }}
        />
      ))}
    </div>
  );
}

type PortfolioGridProps = {
  category: TrackCategory;
};

/**
 * The classic static grid — category tabs live one level up in
 * PortfolioView.tsx (shared with the flow/marquee view), so this
 * component just receives the already-chosen `category` and filters by
 * it.
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
                    <div className="relative flex h-28 items-center justify-center overflow-hidden">
                      <CardEqualizer
                        playing={activePlaying}
                        seed={globalIndex + 1}
                        active={active}
                      />
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