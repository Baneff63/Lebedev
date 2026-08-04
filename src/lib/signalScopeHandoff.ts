// Крошечный pub/sub для передачи scope-визуала из канваса Loader'а в
// постоянный GlobalSignalScope — до того как ирис начнёт открываться, а
// не после того как весь таймлайн Loader'а полностью завершится.

export type HandoffRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Listener = (rect: HandoffRect) => void;

let listener: Listener | null = null;

/** GlobalSignalScope регистрируется здесь один раз при монтировании. */
export function registerSignalScopeHandoff(cb: Listener) {
  listener = cb;
  return () => {
    if (listener === cb) listener = null;
  };
}

/** Loader вызывает это в момент, когда узнал реальный target-rect —
 * задолго до того как ирис начнёт его открывать. */
export function triggerSignalScopeHandoff(rect: HandoffRect) {
  listener?.(rect);
}