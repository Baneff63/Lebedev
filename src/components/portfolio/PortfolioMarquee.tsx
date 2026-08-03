"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer } from "@/context/PlayerContext";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";

const EQ_BAR_COUNT = 11;
// px/frame at ~60fps — deliberately gentle so the rows read as an ambient
// drift, not a ticker.
const DRIFT_SPEED = 0.4;
// How much of the remaining distance-to-center is closed per frame while
// centering the active card. Lower = smoother/slower settle.
const CENTER_EASE = 0.1;
const MOMENTUM_DECAY = 0.94;
// Total pointer movement (px) below which a press+release is still
// treated as a click rather than a drag.
const DRAG_CLICK_THRESHOLD = 6;

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

/**
 * Equalizer used inside marquee cards — reverted to the same behavior as
 * the portfolio grid's CardEqualizer: bars are STATIC (set once, no
 * motion) while the track isn't playing, and only animate via
 * requestAnimationFrame while it actually is. The always-pulsing CSS idle
 * animation from the previous patch has been removed per feedback.
 */
function MarqueeEqualizer({ playing, seed }: { playing: boolean; seed: number }) {
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
    <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-3 pb-3" aria-hidden>
      {Array.from({ length: EQ_BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className={`w-full origin-bottom rounded-full transition-colors duration-300 ${
            playing ? "bg-accent" : "bg-on-dark/30"
          }`}
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

type MarqueeCardProps = {
  track: Track;
  playing: boolean;
  active: boolean;
  onClick: () => void;
};

/**
 * Cover is back to the original flat dark gradient (no generative
 * accent-glow background) — same base color as PortfolioGrid's cards.
 * The dark-to-transparent overlay stays here (unlike the grid) because,
 * unlike the grid, the track title/artist are rendered directly on top of
 * this cover, not below it in a separate content area — it's needed for
 * text contrast regardless of the background style.
 */
const MarqueeCard = forwardRef<HTMLButtonElement, MarqueeCardProps>(function MarqueeCard(
  { track, playing, active, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-cursor
      data-cursor-label={playing ? "pause" : "play"}
      className={`group relative h-[112px] w-[172px] shrink-0 overflow-hidden rounded-2xl border text-left transition-colors sm:h-[124px] sm:w-[196px] md:h-[132px] md:w-[220px] ${
        active ? "border-accent/60" : "border-ink/10 hover:border-ink/25"
      }`}
      style={{ background: "linear-gradient(160deg, #211e1a 0%, #131110 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
        aria-hidden
      />
      <MarqueeEqualizer playing={playing} seed={hashSeed(track.id)} />

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
});

type MarqueeRowProps = {
  tracks: Track[];
  reverse: boolean;
  currentTrackId: string | null;
  isPlaying: boolean;
  onCardClick: (trackId: string) => void;
};

/**
 * One infinite row, driving its own `transform: translate3d(...)` every
 * frame via rAF so three things can share direct control over the offset:
 *
 * 1. Idle auto-drift (the ambient scroll).
 * 2. Drag-to-spin — grab the row and move it manually, with a bit of
 *    momentum after release (same pattern as ToolsOrbit3D.tsx on the
 *    contact page).
 * 3. Auto-centering — whenever this row contains the track that's
 *    currently playing, drift/drag/momentum all pause and the row eases
 *    toward whichever visible duplicate of that track is closest, until
 *    it sits dead-center. It un-freezes the moment that track is no
 *    longer the one playing.
 *
 * The "infinite" illusion: the track list is duplicated an even number of
 * times, and the offset wraps by exactly half of the row's rendered
 * width — since every copy is pixel-identical, wrapping by that
 * half-width is seamless regardless of direction, drag, or copy count.
 */
function MarqueeRow({ tracks, reverse, currentTrackId, isPlaying, onCardClick }: MarqueeRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(0);
  const lastXRef = useRef(0);
  const hoveredRef = useRef(false);
  const halfWidthRef = useRef(0);

  const [dragging, setDragging] = useState(false);

  const copies = tracks.length >= 10 ? 2 : tracks.length >= 5 ? 4 : 6;
  const items = useMemo(() => Array.from({ length: copies }, () => tracks).flat(), [tracks, copies]);

  const rowHasActiveTrack = tracks.some((tr) => tr.id === currentTrackId);
  const isCentering = rowHasActiveTrack && isPlaying;

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => {
      halfWidthRef.current = inner.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (isCentering) velocityRef.current = 0;
  }, [isCentering]);

  useEffect(() => {
    let raf = 0;
    const drift = reverse ? DRIFT_SPEED : -DRIFT_SPEED;

    const wrap = (value: number) => {
      const half = halfWidthRef.current;
      if (half <= 0) return value;
      let v = value % half;
      if (v > 0) v -= half;
      return v;
    };

    const tick = () => {
      const viewport = viewportRef.current;

      if (draggingRef.current) {
        // Offset is being written directly by the pointer handlers below.
      } else if (isCentering && viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;

        let bestDelta: number | null = null;
        items.forEach((track, i) => {
          if (track.id !== currentTrackId) return;
          const el = cardRefs.current[i];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const delta = cardCenter - viewportCenter;
          if (bestDelta === null || Math.abs(delta) < Math.abs(bestDelta)) {
            bestDelta = delta;
          }
        });

        if (bestDelta !== null && Math.abs(bestDelta) > 0.5) {
          offsetRef.current -= bestDelta * CENTER_EASE;
        }
      } else if (Math.abs(velocityRef.current) > 0.02) {
        offsetRef.current += velocityRef.current;
        velocityRef.current *= MOMENTUM_DECAY;
      } else if (!hoveredRef.current) {
        velocityRef.current = 0;
        offsetRef.current += drift;
      }

      offsetRef.current = wrap(offsetRef.current);

      const inner = innerRef.current;
      if (inner) inner.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reverse, isCentering, currentTrackId, items]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    dragMovedRef.current = 0;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    dragMovedRef.current += Math.abs(delta);
    offsetRef.current += delta;
    velocityRef.current = delta;
  };

  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  if (tracks.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      className="marquee-edge-fade overflow-hidden"
      style={{ touchAction: "pan-y", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        endDrag();
        hoveredRef.current = false;
      }}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
    >
      <div ref={innerRef} className="flex w-max gap-3 will-change-transform sm:gap-4">
        {items.map((track, i) => (
          <MarqueeCard
            key={`${track.id}-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            track={track}
            active={track.id === currentTrackId}
            playing={track.id === currentTrackId && isPlaying}
            onClick={() => {
              if (dragMovedRef.current > DRAG_CLICK_THRESHOLD) {
                dragMovedRef.current = 0;
                return;
              }
              onCardClick(track.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

type PortfolioMarqueeProps = {
  category: TrackCategory;
};

/**
 * "Infinite" showcase view for the portfolio page: tracks (filtered by
 * the shared category tabs, same as the grid view) split across two
 * endlessly scrolling rows — the top row drifts left, the bottom row
 * drifts right. See MarqueeRow above for drag-to-spin and the
 * auto-center-on-play behavior.
 */
export function PortfolioMarquee({ category }: PortfolioMarqueeProps) {
  const { t } = useLocale();
  const { tracks, currentTrack, isPlaying, playTrack, toggle } = usePlayer();

  const filtered = useMemo(
    () => tracks.filter((tr) => trackCategory(tr) === category),
    [tracks, category],
  );

  const handleClick = (trackId: string) => {
    const globalIndex = tracks.findIndex((tr) => tr.id === trackId);
    if (globalIndex === -1) return;
    if (trackId === currentTrack?.id) toggle();
    else playTrack(globalIndex);
  };

  const { rowA, rowB } = useMemo(() => {
    const a: Track[] = [];
    const b: Track[] = [];
    filtered.forEach((tr, i) => (i % 2 === 0 ? a : b).push(tr));
    return { rowA: a.length ? a : filtered, rowB: b.length ? b : filtered };
  }, [filtered]);

  if (filtered.length === 0) {
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
      <p className="pointer-events-none mt-1 text-center text-[10px] uppercase tracking-[0.18em] text-muted/50">
        drag to spin
      </p>
    </div>
  );
}
