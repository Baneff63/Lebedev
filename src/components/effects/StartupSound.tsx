"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/context/LocaleContext";

/**
 * Путь к звуку "запуска студии", который проигрывается один раз, сразу
 * после того как отработает Loader (см. Loader.tsx → setLoaded(true)).
 *
 * ВАЖНО: сам аудиофайл сюда не входит — положи его вручную по этому пути
 * (public/sfx/fl-studio-startup.mp3). Подробности и требования к файлу —
 * в public/sfx/README.md.
 */
const STARTUP_SOUND_SRC = "/sfx/fl-studio-startup.mp3";
const STARTUP_SOUND_VOLUME = 0.55;

export function StartupSound() {
  const { isLoaded } = useApp();
  const playedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || playedRef.current) return;
    playedRef.current = true;

    const audio = new Audio(STARTUP_SOUND_SRC);
    audio.volume = STARTUP_SOUND_VOLUME;
    audio.preload = "auto";

    // Если файла нет по указанному пути — просто тихо ничего не делаем
    // (без ошибок в консоли пользователя).
    audio.addEventListener("error", () => {
      /* файл ещё не добавлен — см. public/sfx/README.md */
    });

    const attemptPlay = () => {
      audio.play().catch(() => {
        // Браузер блокирует автозапуск звука до первого жеста
        // пользователя — доигрываем при первом клике/тапе/нажатии клавиши.
        const retry = () => {
          audio.play().catch(() => {});
          window.removeEventListener("pointerdown", retry);
          window.removeEventListener("keydown", retry);
        };
        window.addEventListener("pointerdown", retry, { once: true });
        window.addEventListener("keydown", retry, { once: true });
      });
    };

    attemptPlay();
  }, [isLoaded]);

  return null;
}
