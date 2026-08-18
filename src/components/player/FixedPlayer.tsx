"use client";

import { usePlayer, formatTime } from "@/context/PlayerContext";
import { useLocale } from "@/context/LocaleContext";

function IconPrev() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 2v10M11 2L6 7l5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M11 2v10M3 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
      <path d="M1 1l10 6-10 6V1z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="3" height="12" />
      <rect x="8" y="1" width="3" height="12" />
    </svg>
  );
}

export function FixedPlayer() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    next,
    prev,
    seek,
    setVolume,
  } = usePlayer();
  const { locale } = useLocale();

  if (!tracks.length) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const labels = {
    ru: { prev: "назад", next: "далее", volume: "громкость", play: "играть", pause: "пауза" },
    en: { prev: "prev", next: "next", volume: "volume", play: "play", pause: "pause" },
  }[locale];

  return (
    <div className="fixed-player fixed bottom-0 left-0 z-[60] w-full border-t border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div
        className="absolute top-0 left-0 h-[3px] w-full cursor-pointer bg-ink/8"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - rect.left) / rect.width) * duration);
        }}
        role="slider"
        aria-valuenow={currentTime}
        aria-valuemin={0}
        aria-valuemax={duration}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
          if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 5));
        }}
      >
        <div
          className="h-full origin-left bg-accent transition-transform duration-100 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3.5 md:gap-6 md:px-10 md:py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm tracking-[-0.01em] text-ink md:text-base">
            {currentTrack?.title ?? "—"}
          </p>
          <p className="truncate text-[11px] tracking-[0.06em] text-muted uppercase">
            {currentTrack?.artist ?? "baneoff"}
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={prev}
            data-cursor
            aria-label={labels.prev}
            className="hidden h-9 w-9 items-center justify-center text-muted transition-colors hover:text-ink sm:flex"
          >
            <IconPrev />
          </button>
          <button
            type="button"
            onClick={toggle}
            data-cursor
            data-cursor-label={isPlaying ? labels.pause : labels.play}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-accent hover:text-accent md:h-11 md:w-11"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button
            type="button"
            onClick={next}
            data-cursor
            aria-label={labels.next}
            className="hidden h-9 w-9 items-center justify-center text-muted transition-colors hover:text-ink sm:flex"
          >
            <IconNext />
          </button>
        </div>

        <div className="hidden min-w-[120px] items-center gap-2 tabular-nums text-[11px] tracking-[0.08em] text-muted md:flex">
          <span>{formatTime(currentTime)}</span>
          <span className="text-muted/40">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="hidden w-24 items-center gap-2 lg:flex">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted/60">
            vol
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label={labels.volume}
            className="player-volume h-1 w-full cursor-pointer appearance-none rounded-full bg-ink/10"
          />
        </div>
      </div>
    </div>
  );
}