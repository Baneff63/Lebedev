"use client";

import { useCallback, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/—·";

type ScrambleTextProps = {
  text: string;
  className?: string;
  as?: "span" | "a";
  href?: string;
  dataCursor?: boolean;
};

export function ScrambleText({
  text,
  className,
  as: Tag = "span",
  href,
  dataCursor,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame += 1;
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (frame > i * 2) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      if (frame > text.length * 2 + 4) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, 30);
  }, [text]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplay(text);
  }, [text]);

  if (Tag === "a" && href) {
    return (
      <a
        href={href}
        data-cursor={dataCursor || undefined}
        className={className}
        onMouseEnter={scramble}
        onMouseLeave={reset}
      >
        {display}
      </a>
    );
  }

  return (
    <span
      className={className}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      {display}
    </span>
  );
}
