export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "baneoff-theme";

export const themes: Record<
  Theme,
  { paper: string; ink: string; muted: string; accent: string }
> = {
  light: {
    paper: "#f2ede3",
    ink: "#141210",
    muted: "#8a8278",
    accent: "#c41e3a",
  },
  dark: {
    paper: "#0a0b0d",
    ink: "#ebe7df",
    muted: "#5c6068",
    accent: "#ff3300",
  },
};

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
