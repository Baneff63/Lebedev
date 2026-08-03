"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";
import { generativeCoverStyle } from "@/lib/generativeCover";

const EQ_BAR_COUNT = 16;

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
        // Smoothed vs. the original pass: fewer/rarer target jumps (was a
        // ~15%/frame chance, now ~7%) and a slower glide toward each new
        // target (0.1 vs 0.25) — reads as a calm, continuous pulse
        // instead of a jittery flicker.
        if (Math.random() > 0.93) {
          const center = Math.abs(i - EQ_BAR_COUNT / 2) / (EQ_BAR_COUNT / 2);
          targets[i] = 0.24 + Math.random() * 0.55 * (1 - center * 0.35);
        }
        current[i] += (targets[i] - current[i]) * 0.1;
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
 * The classic static grid — category tabs now live one level up in
 * PortfolioView.tsx (shared with the flow/marquee view), so this
 * component just receives the already-chosen `category` and filters by
 * it. Everything else (TiltCard, play/pause wiring, layout) is unchanged
 * from before; the only other change is the cover background, which now
 * uses the seeded generative art from generativeCover.ts instead of a
 * flat gradient.
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
                    <div className="relative flex h-28 items-center justify-center overflow-hidden">
                      {/* Generated cover art (seeded from track.id) as its
                          own background layer — see generativeCover.ts.
                          Kept as a separate absolute layer (not applied
                          directly to this div) so its hue-rotate filter
                          never touches the equalizer bars or button
                          rendered on top of it. */}
                      <div
                        className="absolute inset-0"
                        style={generativeCoverStyle(track.id)}
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/25"
                        aria-hidden
                      />
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
