"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";

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

export function PortfolioGrid() {
  const { t } = useLocale();
  const { tracks, currentIndex, isPlaying, currentTime, duration, playTrack, toggle } =
    usePlayer();
  const [tab, setTab] = useState<TrackCategory>("mixed");

  const tabs: { id: TrackCategory; label: string }[] = [
    { id: "mixed", label: t.work.tabs.mixed },
    { id: "beats", label: t.work.tabs.beats },
    { id: "personal", label: t.work.tabs.personal },
  ];

  const filtered = useMemo(
    () => tracks.filter((tr) => trackCategory(tr) === tab),
    [tracks, tab],
  );

  const handleClick = (globalIndex: number) => {
    if (globalIndex === currentIndex) toggle();
    else playTrack(globalIndex);
  };

  return (
    <div className="flex h-full flex-col overflow-x-hidden">
      <div className="flex shrink-0 flex-wrap gap-2">
        {tabs.map((tItem) => (
          <button
            key={tItem.id}
            type="button"
            onClick={() => setTab(tItem.id)}
            data-cursor
            className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              tab === tItem.id
                ? "border-accent bg-accent text-paper"
                : "border-ink/15 text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/*
        IMPORTANT (bug fix): this panel used to only set `overflow-y-auto`.
        TiltCard applies `perspective(...) rotateY() rotateX() scale(1.02)`
        on hover, which can make a card's rendered bounding box a fraction
        of a pixel wider than its layout box. With no `overflow-x` rule the
        browser defaults to `visible` for the x-axis even though y is
        `auto`, so that sub-pixel overflow was enough to spawn a horizontal
        scrollbar at the bottom of the panel on hover. Setting
        `overflow-x-hidden` here (and `overflow-x-hidden` one level up, on
        the flex column above) removes the x-axis scrollbar entirely while
        leaving vertical scrolling untouched.
      */}
      <div className="thin-scrollbar mt-6 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1 pb-2">
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
