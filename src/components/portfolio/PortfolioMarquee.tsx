"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer } from "@/context/PlayerContext";
import type { Track, TrackCategory } from "@/types/site";
import { trackCategory } from "@/types/site";
import { generativeCoverStyle, seedToInt } from "@/lib/generativeCover";

const IDLE_BAR_COUNT = 11;
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

/**
 * Equalizer used inside marquee cards.
 *
 * Idle bars are pure CSS (`.eq-bar-idle`, see globals.css) with a
 * per-bar duration/delay derived from the track's own id, so it's
 * deterministic and cheap enough to render across every duplicated
 * marquee clone with no JS animation loop involved.
 *
 * Only the card that IS the active/playing track swaps to a small
 * rAF-driven animation — tuned deliberately calm (slow interpolation,
 * infrequent target changes) after the first pass felt too jittery/fast
 * next to the rest of the site's motion language.
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
          max: 0.38 + v * 0.3,
          duration: 1.4 + ((seed + i * 7) % 9) * 0.22,
          delay: ((seed * 3 + i * 11) % 20) * 0.08,
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
        // Much less frequent target changes (was a ~18%/frame chance,
        // now ~6%) and a slower glide toward each new target (0.09 vs the
        // original 0.3) — the combination is what actually reads as
        // "calmer" rather than just "slower".
        if (Math.random() > 0.94) {
          targets[i] = 0.22 + Math.random() * 0.5;
        }
        current[i] += (targets[i] - current[i]) * 0.09;
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
            style={(playing ? playingStyle : idleStyle) as unknown as CSSProperties}
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

/**
 * The generated cover (see generativeCover.ts) is rendered as its own
 * absolutely-positioned layer, a *sibling* of the equalizer/label/button —
 * not a wrapper around them. The cover style includes a `hue-rotate`
 * filter for per-track variety; if that filter were applied to the whole
 * card it would also distort the text and icons sitting on top of it.
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
    >
      <div className="absolute inset-0" style={generativeCoverStyle(track.id)} aria-hidden />
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
});

type MarqueeRowProps = {
  tracks: Track[];
  reverse: boolean;
  currentTrackId: string | null;
  isPlaying: boolean;
  onCardClick: (trackId: string) => void;
};

/**
 * One infinite row. Unlike the first version (a plain CSS `animation`),
 * this drives its own `transform: translate3d(...)` every frame via rAF,
 * because three things now need direct control over that offset:
 *
 * 1. Idle auto-drift (the original ambient scroll).
 * 2. Drag-to-spin — grab the row and move it manually, with a bit of
 *    momentum after release (same interaction pattern already used for
 *    the tools carousel on the contact page, ToolsOrbit3D.tsx).
 * 3. Auto-centering — whenever this row contains the track that's
 *    currently playing, drift/drag/momentum all pause and the row
 *    instead eases toward whichever visible duplicate of that track is
 *    closest, until it sits dead-center. It un-freezes and resumes
 *    drifting the moment that track is no longer the one playing
 *    (paused, or playback moves to a track in the other row).
 *
 * The "infinite" illusion itself still works the same way as before:
 * the track list is duplicated an even number of times, and the offset
 * wraps by exactly half of the row's rendered width — since every copy
 * is pixel-identical, wrapping by that half-width is visually seamless
 * regardless of direction, drag, or how many copies there are.
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

  // Short lists get duplicated more times so the row still reads as
  // generously full rather than sparse; always an even count (see note
  // above on why that matters for the wrap math).
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

  // Kill any leftover drag momentum the instant centering takes over, so
  // it can't fight the centering pull on its way in.
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
        // Offset is being written directly by the pointer handlers below;
        // nothing to do here besides letting it through to the DOM.
      } else if (isCentering && viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;

        // Among every visible duplicate of the active track, nudge toward
        // whichever one needs the smallest correction — this is what
        // makes it "just settle" instead of jumping to a fixed copy,
        // however this row happened to be positioned when playback
        // started.
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
        // Momentum left over from a drag release.
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
              // A drag that moved more than a few px shouldn't also fire
              // a click when the pointer is released.
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

  // Split alternately (even/odd index) rather than in half, so the two
  // rows stay visually mixed regardless of the order tracks were added
  // in the admin panel.
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
