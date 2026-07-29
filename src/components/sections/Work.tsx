"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { usePlayer, formatTime } from "@/context/PlayerContext";
import { SectionNumber } from "@/components/effects/SectionNumber";

function IconPlay() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
      <path d="M0.5 0.5l9 5.5-9 5.5V0.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
      <rect x="0.5" y="0.5" width="3" height="11" />
      <rect x="6.5" y="0.5" width="3" height="11" />
    </svg>
  );
}

export function Work() {
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

      gsap.from(".work-row", {
        scrollTrigger: { trigger: ".work-playlist", start: "top 78%" },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t, tracks.length]);

  // Preload metadata for every track so we can show a duration in the list.
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

  const handleRowClick = (index: number) => {
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
      className="relative overflow-hidden border-t border-ink/8 px-5 py-24 md:px-10 md:py-40"
    >
      <SectionNumber num="03" className="top-12 right-4 md:right-10" />

      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              {t.work.label}
            </p>
            <h2 className="work-intro mt-8 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              {headlineLines.map((line, i) => (
                <span
                  key={line}
                  className={`line block ${i === 1 ? "italic text-accent" : ""}`}
                >
                  {line}
                </span>
              ))}
            </h2>
            <p className="work-body mt-8 max-w-[360px] text-[15px] leading-[1.7] text-muted">
              {t.work.body}
            </p>

            {tracks.length > 0 && (
              <p className="mt-6 text-[11px] tracking-[0.2em] text-muted/50 uppercase">
                {tracks.length} {t.work.trackCountLabel}
              </p>
            )}
          </div>

          <div className="work-playlist md:col-span-7 md:col-start-6">
            {tracks.length === 0 ? (
              <div className="border-t border-ink/8 py-16 text-center">
                <p className="font-display text-xl italic text-muted">
                  {t.work.emptyTitle}
                </p>
                <p className="mt-2 text-[13px] text-muted/70">
                  {t.work.emptyBody}
                </p>
              </div>
            ) : (
              <ul className="border-t border-ink/8">
                {tracks.map((track, i) => {
                  const active = i === currentIndex;
                  const activePlaying = active && isPlaying;
                  const trackDuration = active
                    ? duration || durations[track.id]
                    : durations[track.id];

                  return (
                    <li key={track.id} className="work-row border-b border-ink/8">
                      <button
                        type="button"
                        onClick={() => handleRowClick(i)}
                        data-cursor
                        data-cursor-label={
                          activePlaying ? t.work.cursorPause : t.work.cursorPlay
                        }
                        className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-ink/[0.03] md:gap-6"
                      >
                        <span className="w-7 shrink-0 text-[12px] tabular-nums text-muted/50">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            active
                              ? "border-accent text-accent"
                              : "border-ink/15 text-ink/60 group-hover:border-accent group-hover:text-accent"
                          }`}
                        >
                          {activePlaying ? <IconPause /> : <IconPlay />}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate font-display text-base tracking-[-0.01em] ${
                              active ? "text-accent" : "text-ink"
                            }`}
                          >
                            {track.title}
                          </span>
                          <span className="block truncate text-[11px] uppercase tracking-[0.14em] text-muted">
                            {track.artist}
                          </span>
                        </span>

                        {activePlaying && (
                          <span className="hidden items-center gap-2 sm:flex" aria-hidden>
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-blink" />
                          </span>
                        )}

                        <span className="hidden shrink-0 tabular-nums text-[11px] text-muted sm:block">
                          {active
                            ? `${formatTime(currentTime)} / ${formatTime(trackDuration ?? 0)}`
                            : formatTime(trackDuration ?? 0)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
