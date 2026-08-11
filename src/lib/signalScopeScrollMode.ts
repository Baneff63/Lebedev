// Крошечный флаг, включаемый только на главной странице (см.
// HomeSignalScopeController.tsx). Пока он включён, GlobalSignalScope не
// ждёт смены роута, чтобы перелететь к новому слоту — а каждый кадр сам
// перемеряет текущий видимый `[data-signal-scope-slot]` через
// getBoundingClientRect() и следует за ним 1:1. Поскольку
// getBoundingClientRect() уже учитывает и скролл документа, и CSS
// transform/scale элемента, этого достаточно, чтобы осциллограф "ехал"
// вместе со страницей при скролле и рос, если сам слот масштабируется
// (см. HomeFinale.tsx) — никакой дополнительной синхронизации не нужно.

let liveMode = false;

export function setSignalScopeLiveMode(active: boolean) {
  liveMode = active;
}

export function isSignalScopeLiveMode() {
  return liveMode;
}
