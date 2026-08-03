"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer } from "@/context/PlayerContext";
import type { Track } from "@/types/site";
import { generativeCoverStyle, seedToInt } from "@/lib/generativeCover";

const IDLE_BAR_COUNT = 11;

/**
 * Equalizer used inside marquee cards.
 *
 * Idle bars are pure CSS (`.eq-bar-idle`, see globals.css) with a
 * per-bar duration/delay derived from the track's own id, so it's
 * deterministic (never reshuffles between renders) and cheap enough to
 * render dozens of times at once across every duplicated marquee clone —
 * no JS animation loop running for cards that aren't actually playing.
 *
 * Only the card that IS the active/playing track swaps to a small
 * rAF-driven animation for a snappier "it's really playing" feel. Since
 * at most one track is ever playing, that's at most a handful of rAF
 * loops (one per visible clone of that one track), never one per card.
 */
function MarqueeEqualizer({ playing, seed }: { playing: boolean; seed: number }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);

  const idle = useMemo(
    () =>
      Array.from({ length: IDLE_BAR_COUNT }, (_, i) => {
        const v = Math.abs(Math.sin(seed * 12.9898 + i * 4.233));
        return {
          min: 0.14 + v * 0.16,
          max: 0.4 + v * 0.35,
          duration: 1.1 + ((seed + i * 7) % 9) * 0.18,
          delay: ((seed * 3 + i * 11) % 20) * 0.07,
        };
      }),
    [seed],
  );

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!playing) return;

    const targets = idle.map((b) => (b.min + b.max) / 2);
    const current = [...targets];

    const tick = () => {
      for (let i = 0; i < IDLE_BAR_COUNT; i++) {
        if (Math.random() > 0.82) {
          targets[i] = 0.2 + Math.random() * 0.75;
        }
        current[i] += (targets[i] - current[i]) * 0.3;
        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${current[i]})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, idle]);

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-3 pb-3" aria-hidden>
      {idle.map((b, i) => {
        const idleStyle: Record<string, string | number> = {
          height: "100%",
          animationDuration: `${b.duration}s`,
          animationDelay: `${b.delay}s`,
          "--eq-min": b.min,
          "--eq-max": b.max,
        };
        const playingStyle: CSSProperties = {
          height: "100%",
          transform: `scaleY(${(b.min + b.max) / 2})`,
        };

        return (
          <div
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className={`w-full origin-bottom rounded-full transition-colors duration-300 ${
              playing ? "bg-accent" : "bg-on-dark/30 eq-bar-idle"
            }`}
            style={(playing ? playingStyle : idleStyle) as CSSProperties}
          />
        );
      })}
    </div>
  );
}

type MarqueeCardProps = {
  track: Track;
  playing: boolean;
  active: boolean;
  onClick: () => void;
};

function MarqueeCard({ track, playing, active, onClick }: MarqueeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor
      data-cursor-label={playing ? "pause" : "play"}
      className={`group relative h-[112px] w-[172px] shrink-0 overflow-hidden rounded-2xl border text-left transition-colors sm:h-[124px] sm:w-[196px] md:h-[132px] md:w-[220px] ${
        active ? "border-accent/60" : "border-ink/10 hover:border-ink/25"
      }`}
      style={generativeCoverStyle(track.id)}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"
        aria-hidden
      />
      <MarqueeEqualizer playing={playing} seed={seedToInt(track.id)} />

      <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-on-dark/30 bg-paper/10 text-[11px] text-on-dark backdrop-blur-sm transition-transform group-hover:scale-105">
        {playing ? "❙❙" : "▶"}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate font-display text-[13px] leading-tight text-on-dark">
          {track.title}
        </p>
        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-on-dark/60">
          {track.artist}
        </p>
      </div>
    </button>
  );
}

type MarqueeRowProps = {
  tracks: Track[];
  reverse: boolean;
  currentTrackId: string | null;
  isPlaying: boolean;
  onCardClick: (trackId: string) => void;
};

function MarqueeRow({ tracks, reverse, currentTrackId, isPlaying, onCardClick }: MarqueeRowProps) {
  const [paused, setPaused] = useState(false);

  // Copies are always even, so a `translateX(-50%)` keyframe lines the
  // first half of the rendered row up exactly with the second half — the
  // loop resets invisibly instead of visibly "jumping". Short track lists
  // get duplicated more times so the row still reads as generously full
  // rather than sparse and repeating too obviously.
  const copies = tracks.length >= 10 ? 2 : tracks.length >= 5 ? 4 : 6;
  const items = useMemo(() => Array.from({ length: copies }, () => tracks).flat(), [tracks, copies]);
  const duration = Math.max(16, items.length * 3.4);

  if (tracks.length === 0) return null;

  return (
    <div
      className="marquee-edge-fade overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className={`flex w-max gap-3 sm:gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {items.map((track, i) => (
          <MarqueeCard
            key={`${track.id}-${i}`}
            track={track}
            active={track.id === currentTrackId}
            playing={track.id === currentTrackId && isPlaying}
            onClick={() => onCardClick(track.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * "Infinite" showcase view for the portfolio page: every track split
 * across two endlessly scrolling rows — the top row drifts left, the
 * bottom row drifts right — each row duplicated so the loop never
 * visibly resets. Meant to read as a large, constantly-alive catalogue
 * rather than a fixed page of cards.
 *
 * Pure CSS transform animation (reusing the same `marquee` /
 * `marquee-reverse` keyframes already used for the text marquee
 * elsewhere on the site — see Marquee.tsx / globals.css), so it stays
 * smooth on phones without any extra animation library. Hovering a row
 * (or, on touch, pressing it) pauses that row so a track is actually easy
 * to tap; `prefers-reduced-motion: reduce` already freezes all animation
 * globally (see globals.css), so this respects that automatically too.
 */
export function PortfolioMarquee() {
  const { t } = useLocale();
  const { tracks, currentTrack, isPlaying, playTrack, toggle } = usePlayer();

  const handleClick = (trackId: string) => {
    const globalIndex = tracks.findIndex((tr) => tr.id === trackId);
    if (globalIndex === -1) return;
    if (trackId === currentTrack?.id) toggle();
    else playTrack(globalIndex);
  };

  // Split alternately (even/odd index) rather than in half, so the two
  // rows stay visually mixed regardless of the order tracks were added
  // in the admin panel.
  const { rowA, rowB } = useMemo(() => {
    const a: Track[] = [];
    const b: Track[] = [];
    tracks.forEach((tr, i) => (i % 2 === 0 ? a : b).push(tr));
    return { rowA: a.length ? a : tracks, rowB: b.length ? b : tracks };
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-ink/12 text-center">
        <div>
          <p className="font-display text-xl italic text-muted">{t.work.emptyTitle}</p>
          <p className="mt-2 text-[13px] text-muted/70">{t.work.emptyBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-4 sm:gap-5">
      <MarqueeRow
        tracks={rowA}
        reverse={false}
        currentTrackId={currentTrack?.id ?? null}
        isPlaying={isPlaying}
        onCardClick={handleClick}
      />
      <MarqueeRow
        tracks={rowB}
        reverse={true}
        currentTrackId={currentTrack?.id ?? null}
        isPlaying={isPlaying}
        onCardClick={handleClick}
      />
    </div>
  );
}
