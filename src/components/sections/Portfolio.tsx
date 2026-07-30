"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { SectionNumber } from "@/components/effects/SectionNumber";
import { TiltCard } from "@/components/ui/TiltCard";

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
      <path d="M1 1l5.5 5.5L1 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

/** Animated bars inside a card's cover — idle & subtle when paused, alive when the track is playing. */
function CardEqualizer({ playing, seed }: { playing: boolean; seed: number }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);

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

    const targets = [...idleHeights];
    const current = [...idleHeights];

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
  }, [playing, idleHeights]);

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, tracks.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

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

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="md:max-w-[380px]">
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
          </div>

          {tracks.length > 0 && (
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                disabled={!canPrev}
                data-cursor
                aria-label="prev"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-25"
              >
                <IconChevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                disabled={!canNext}
                data-cursor
                aria-label="next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-25"
              >
                <IconChevron direction="right" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-10">
          {tracks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/12 py-16 text-center">
              <p className="font-display text-xl italic text-muted">{t.work.emptyTitle}</p>
              <p className="mt-2 text-[13px] text-muted/70">{t.work.emptyBody}</p>
            </div>
          ) : (
            <>
              <div
                ref={scrollerRef}
                className="work-scroller no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:mx-0 md:px-0"
              >
                {tracks.map((track, i) => {
                  const active = i === currentIndex;
                  const activePlaying = active && isPlaying;
                  const trackDuration = active
                    ? duration || durations[track.id]
                    : durations[track.id];
                  const platforms = track.platforms
                    ? (Object.entries(track.platforms).filter(([, url]) => !!url) as [
                        string,
                        string,
                      ][])
                    : [];

                  return (
                    <TiltCard
                      key={track.id}
                      className="work-card w-[78vw] shrink-0 snap-start sm:w-[300px]"
                    >
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
                            background: "linear-gradient(160deg, #211e1a 0%, #131110 100%)",
                          }}
                        >
                          <CardEqualizer playing={activePlaying} seed={i + 1} />
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
                  );
                })}
              </div>

              {/* Mobile: swipe hint instead of arrow buttons (arrows are hidden below md). */}
              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-muted/50 md:hidden">
                ← swipe →
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
