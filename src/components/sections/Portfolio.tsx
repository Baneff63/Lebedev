"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Track } from "@/types/site";

function IconPlay() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor" aria-hidden>
      <path d="M0.5 0.5l10 6-10 6V0.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor" aria-hidden>
      <rect x="0.5" y="0.5" width="3.2" height="12" />
      <rect x="7.3" y="0.5" width="3.2" height="12" />
    </svg>
  );
}

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="8"
      height="13"
      viewBox="0 0 8 13"
      fill="none"
      aria-hidden
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M1 1l5.5 5.5L1 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, ReactNode> = {
  spotify: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.58-1.04 8.5-.6 11.66 1.34.36.22.47.68.25 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 1 1-.55-1.8c4.36-1.32 9.78-.68 13.5 1.6.44.27.58.85.31 1.29Zm.13-3.4C15.98 8.4 9.9 8.2 6.36 9.28a1.13 1.13 0 1 1-.66-2.16c4.06-1.23 10.8-1 15.06 1.55a1.13 1.13 0 1 1-1.16 1.94Z" />
    </svg>
  ),
  appleMusic: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 2c-.2 0-.4 0-.6.1L9.3 3.9c-1 .2-1.7 1.1-1.7 2.1v9.6a3 3 0 1 0 1.5 2.6v-7.9l7.4-1.7v6.1a3 3 0 1 0 1.5 2.6V4a2 2 0 0 0-2-2h-.1-.4Z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.7a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.6A3 3 0 0 0 .5 6.7 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.3 3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.3ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
    </svg>
  ),
  soundcloud: (
    <svg width="16" height="14" viewBox="0 0 32 24" fill="currentColor" aria-hidden>
      <path d="M8 24h16.5c3 0 5.5-2.4 5.5-5.4 0-3-2.5-5.4-5.5-5.4-.5 0-1 .1-1.4.2C22.5 9.6 19.6 7 16 7c-1 0-1.9.2-2.7.6-.4.2-.5.4-.5.8v14.8c0 .5.4.8.8.8H8Zm-2-.3c.3 0 .5-.2.5-.5V9.6c0-.3-.2-.5-.5-.5s-.5.2-.5.5v13.6c0 .3.2.5.5.5Zm-2.5 0c.2 0 .4-.2.4-.4V11.8c0-.2-.2-.4-.4-.4s-.4.2-.4.4v11.5c0 .2.2.4.4.4Zm-2.5-.6c.2 0 .3-.1.3-.3v-8.4c0-.2-.1-.3-.3-.3s-.3.1-.3.3v8.4c0 .2.1.3.3.3Z" />
    </svg>
  ),
};

const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtube: "YouTube",
  soundcloud: "SoundCloud",
};

const EQ_BAR_COUNT = 20;
// How many track cards are shown per slider page.
const PAGE_SIZE = 4;

/**
 * Animated bars inside a card's cover.
 * - Not playing: gentle deterministic "idle" shape per card.
 * - Playing + active card: driven by the real AnalyserNode frequency data
 *   of the currently playing track (low frequencies get more bars, like a
 *   real equalizer).
 * - Playing + not active (shouldn't really happen, kept as safety net):
 *   falls back to the old pseudo-random animation.
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

  // Deterministic "idle" heights per card so it still reads as a waveform, not a flat line.
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
      // Ignore the very top of the spectrum — it's almost always silent
      // for music and just makes the bars look dead on the right side.
      const usableBins = Math.max(1, Math.floor(analyser.frequencyBinCount * 0.6));

      const tick = () => {
        analyser.getByteFrequencyData(data);
        for (let i = 0; i < EQ_BAR_COUNT; i++) {
          // Exponential mapping: more bars sample the low/mid frequencies,
          // matching how a real audio equalizer is laid out.
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

    // Fallback: analyser not ready yet (e.g. first frame before the
    // AudioContext resumes) — keep the old pseudo-random animation so
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

export function Portfolio() {
  const { t } = useLocale();
  const {
    tracks,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    toggle,
  } = usePlayer();
  const sectionRef = useRef<HTMLElement>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);

  // Group tracks into pages of PAGE_SIZE while keeping each track's
  // original index (needed to compare against currentIndex from the player).
  const pages = useMemo(() => {
    const chunks: { track: Track; index: number }[][] = [];
    for (let i = 0; i < tracks.length; i += PAGE_SIZE) {
      chunks.push(
        tracks.slice(i, i + PAGE_SIZE).map((track, j) => ({ track, index: i + j })),
      );
    }
    return chunks;
  }, [tracks]);

  const pageCount = pages.length;

  // Keep page in range if the track list shrinks/changes.
  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [pageCount, page]);

  // Follow the currently playing track to its page automatically.
  useEffect(() => {
    if (pageCount === 0) return;
    const targetPage = Math.floor(currentIndex / PAGE_SIZE);
    if (targetPage !== page && targetPage < pageCount) setPage(targetPage);
    // Only re-run when the active track changes, not on every page click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const prevPage = () => setPage((p) => (p - 1 + pageCount) % pageCount);
  const nextPage = () => setPage((p) => (p + 1) % pageCount);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".work-intro .line", {
        scrollTrigger: { trigger: ".work-intro", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".work-body", {
        scrollTrigger: { trigger: ".work-body", start: "top 85%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".work-service", {
        scrollTrigger: { trigger: ".work-services", start: "top 85%" },
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      });

      gsap.from(".work-card", {
        scrollTrigger: { trigger: ".work-scroller", start: "top 78%" },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t, tracks.length]);

  // Preload metadata for every track so we can show a duration in the card.
  useEffect(() => {
    let cancelled = false;
    const probes: HTMLAudioElement[] = [];

    tracks.forEach((track) => {
      if (!track.src) return;
      const probe = new Audio();
      probe.preload = "metadata";
      const onLoaded = () => {
        if (cancelled) return;
        setDurations((prev) =>
          prev[track.id] !== undefined
            ? prev
            : { ...prev, [track.id]: probe.duration || 0 },
        );
      };
      probe.addEventListener("loadedmetadata", onLoaded);
      probe.src = track.src;
      probes.push(probe);
    });

    return () => {
      cancelled = true;
      probes.forEach((probe) => {
        probe.src = "";
      });
    };
  }, [tracks]);

  const headlineLines = t.work.headline.split("\n");

  const handleCardClick = (index: number) => {
    if (index === currentIndex) {
      toggle();
    } else {
      playTrack(index);
    }
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink/8 px-5 py-20 md:px-10 md:py-32"
    >
      <SectionNumber num="02" className="top-12 right-4 md:right-10" />

      <div className="relative mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start md:gap-8">
          {/* Left column: intro text — stays put while cards live on the right */}
          <div className="md:sticky md:top-32 md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              {t.work.label}
            </p>
            <h2 className="work-intro mt-8 font-display text-[clamp(1.65rem,3.6vw,2.75rem)] leading-[1.12] tracking-[-0.02em] text-ink">
              {headlineLines.map((line, i) => (
                <span key={line} className={`line block ${i === 1 ? "italic text-accent" : ""}`}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="work-body mt-7 max-w-[360px] text-[15px] leading-[1.7] text-muted">
              {t.work.body}
            </p>

            {tracks.length > 0 && (
              <p className="mt-5 text-[11px] tracking-[0.2em] text-muted/50 uppercase">
                {tracks.length} {t.work.trackCountLabel}
              </p>
            )}

            <div className="work-services mt-9 flex flex-wrap gap-2.5">
              {t.work.services.map((service) => (
                <span
                  key={service}
                  className="work-service rounded-full border border-ink/12 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink/70"
                >
                  {service}
                </span>
              ))}
            </div>

            {/* Slider controls — kept next to the intro on desktop so the
                card list itself never grows past PAGE_SIZE cards tall. */}
            {pageCount > 1 && (
              <div className="mt-9 flex items-center gap-4">
                <button
                  type="button"
                  onClick={prevPage}
                  data-cursor
                  aria-label="prev page"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <IconChevron direction="left" />
                </button>

                <div className="flex items-center gap-2">
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      aria-label={`page ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === page ? "w-6 bg-accent" : "w-1.5 bg-ink/15 hover:bg-ink/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextPage}
                  data-cursor
                  aria-label="next page"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <IconChevron direction="right" />
                </button>
              </div>
            )}
          </div>

          {/* Right column: track cards, paginated PAGE_SIZE at a time */}
          <div className="md:col-span-8">
            {tracks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/12 py-16 text-center">
                <p className="font-display text-xl italic text-muted">{t.work.emptyTitle}</p>
                <p className="mt-2 text-[13px] text-muted/70">{t.work.emptyBody}</p>
              </div>
            ) : (
              <div className="work-scroller overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out-expo"
                  style={{ transform: `translateX(-${page * 100}%)` }}
                >
                  {pages.map((pageTracks, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="grid w-full shrink-0 grid-cols-1 content-start gap-4 sm:grid-cols-2"
                    >
                      {pageTracks.map(({ track, index: i }) => {
                        const active = i === currentIndex;
                        const activePlaying = active && isPlaying;
                        const trackDuration = active
                          ? duration || durations[track.id]
                          : durations[track.id];
                        const platforms = track.platforms
                          ? (Object.entries(track.platforms).filter(
                              ([, url]) => !!url,
                            ) as [string, string][])
                          : [];

                        return (
                          /*
                            IMPORTANT: the GSAP entrance animation
                            (".work-card") lives on THIS plain wrapper div,
                            not on TiltCard itself. TiltCard writes to its
                            own inner div's `transform` on every
                            mousemove/mouseleave (the tilt effect) — if the
                            GSAP-animated class had been on that same node,
                            the two systems would fight over the same inline
                            `transform`, leaving the card visually offset
                            (translated down) until a hover event overwrote
                            it. Keeping them on separate DOM nodes avoids the
                            conflict entirely.
                          */
                          <div key={track.id} className="work-card w-full">
                            <TiltCard className="h-full w-full">
                              <div
                                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors ${
                                  active
                                    ? "border-accent/50 bg-accent/[0.04]"
                                    : "border-ink/10 hover:border-ink/25"
                                }`}
                              >
                                <div
                                  className="relative flex h-32 items-end justify-between overflow-hidden p-4"
                                  style={{
                                    background:
                                      "linear-gradient(160deg, #211e1a 0%, #131110 100%)",
                                  }}
                                >
                                  <CardEqualizer
                                    playing={activePlaying}
                                    seed={i + 1}
                                    active={active}
                                  />
                                  <div
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                                    aria-hidden
                                  />
                                  <span className="relative z-10 font-display text-2xl text-on-dark/70 tabular-nums">
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCardClick(i)}
                                    data-cursor
                                    data-cursor-label={
                                      activePlaying ? t.work.cursorPause : t.work.cursorPlay
                                    }
                                    className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-on-dark/30 bg-paper/10 text-on-dark backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:border-accent hover:bg-accent hover:text-paper"
                                  >
                                    {activePlaying ? <IconPause /> : <IconPlay />}
                                  </button>
                                </div>

                                <div className="flex flex-1 flex-col gap-3 p-5">
                                  <div>
                                    <p
                                      className={`truncate font-display text-lg tracking-[-0.01em] ${
                                        active ? "text-accent" : "text-ink"
                                      }`}
                                    >
                                      {track.title}
                                    </p>
                                    <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted">
                                      {track.artist}
                                      {track.genre ? ` · ${track.genre}` : ""}
                                    </p>
                                  </div>

                                  {track.tools && track.tools.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {track.tools.map((tool) => (
                                        <span
                                          key={tool}
                                          className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-ink/60"
                                        >
                                          {tool}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="mt-auto flex items-center justify-between pt-2">
                                    <span className="flex items-center gap-2 tabular-nums text-[11px] text-muted">
                                      {activePlaying && (
                                        <span
                                          className="h-1.5 w-1.5 rounded-full bg-accent animate-blink"
                                          aria-hidden
                                        />
                                      )}
                                      {active
                                        ? `${formatTime(currentTime)} / ${formatTime(trackDuration ?? 0)}`
                                        : formatTime(trackDuration ?? 0)}
                                    </span>

                                    {platforms.length > 0 && (
                                      <div className="flex items-center gap-2.5">
                                        {platforms.map(([key, url]) => (
                                          <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            data-cursor
                                            data-cursor-label={PLATFORM_LABELS[key] ?? key}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-muted transition-colors hover:text-accent"
                                            aria-label={`${t.work.listenLabel} ${PLATFORM_LABELS[key] ?? key}`}
                                          >
                                            {PLATFORM_ICONS[key] ?? null}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TiltCard>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}