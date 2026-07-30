"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Track } from "@/types/site";

type PlayerContextValue = {
  tracks: Track[];
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  playTrack: (index: number) => void;
  /** Returns the live AnalyserNode for the current track, or null if audio hasn't started yet. */
  getAnalyser: () => AnalyserNode | null;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type PlayerProviderProps = {
  tracks: Track[];
  children: ReactNode;
};

export function PlayerProvider({ tracks, children }: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const safeIndex =
    tracks.length === 0 ? 0 : Math.min(currentIndex, tracks.length - 1);
  const currentTrack = tracks[safeIndex] ?? null;

  // Lazily creates the AudioContext/AnalyserNode graph. Must be called from
  // inside a user gesture (click) the first time, since browsers block
  // AudioContext creation/resume otherwise.
  const ensureAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined") return null;

    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;

      try {
        const ctx = new Ctx();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyser.connect(ctx.destination); // keep audio audible
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch {
        // createMediaElementSource can only be called once per element;
        // if this ever throws, fall back gracefully to no analyser.
        return null;
      }
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    return analyserRef.current;
  }, []);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    // Required so the AnalyserNode can read frequency data from
    // cross-origin sources (Vercel Blob). The blob storage serves
    // permissive CORS headers by default, so this is safe.
    audio.crossOrigin = "anonymous";
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setCurrentIndex((i) => (tracks.length ? (i + 1) % tracks.length : 0));
      setIsPlaying(tracks.length > 0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
      }
    };
    // The <audio> element is only recreated when the track list itself
    // changes. Volume changes are applied via the effect below, without
    // tearing down and recreating the element (that was previously causing
    // playback to stop whenever the volume slider moved).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    audio.src = currentTrack.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (isPlayingRef.current) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack?.id, currentTrack?.src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && currentTrack) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback(() => {
    ensureAnalyser();
    setIsPlaying(true);
  }, [ensureAnalyser]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const toggle = useCallback(() => {
    ensureAnalyser();
    setIsPlaying((p) => !p);
  }, [ensureAnalyser]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    ensureAnalyser();
    setCurrentIndex((i) => (i + 1) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length, ensureAnalyser]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (!tracks.length) return;
    ensureAnalyser();
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length, ensureAnalyser]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
  }, []);

  const playTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= tracks.length) return;
      ensureAnalyser();
      setCurrentIndex(index);
      setIsPlaying(true);
    },
    [tracks.length, ensureAnalyser],
  );

  const value = useMemo(
    () => ({
      tracks,
      currentTrack,
      currentIndex: safeIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      toggle,
      play,
      pause,
      next,
      prev,
      seek,
      setVolume,
      playTrack,
      getAnalyser,
    }),
    [
      tracks,
      currentTrack,
      safeIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      toggle,
      play,
      pause,
      next,
      prev,
      seek,
      setVolume,
      playTrack,
      getAnalyser,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}