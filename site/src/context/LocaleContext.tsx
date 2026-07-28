"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { content, type Content, type Locale } from "@/lib/i18n/content";
import { applyTheme, type Theme } from "@/lib/theme";
import type { SiteData, SiteLinks, Track } from "@/types/site";
import { getDefaultSiteData } from "@/types/site";

type AppContextValue = {
  locale: Locale;
  t: Content;
  tracks: Track[];
  links: SiteLinks;
  siteData: SiteData | null;
  refreshContent: () => Promise<void>;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoaded: boolean;
  setLoaded: (loaded: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru");
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoaded, setLoaded] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        setSiteData(await res.json());
      }
    } catch {
      setSiteData(getDefaultSiteData());
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") {
      setThemeState(attr);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add("theme-transition");
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 600);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "ru" ? "en" : "ru"));
  }, []);

  const defaults = getDefaultSiteData();
  const t = siteData?.[locale] ?? content[locale];
  const tracks = siteData?.tracks ?? [];
  const links = siteData?.links ?? defaults.links;

  const value = useMemo(
    () => ({
      locale,
      t,
      tracks,
      links,
      siteData,
      refreshContent: loadContent,
      toggleLocale,
      setLocale,
      theme,
      toggleTheme,
      setTheme,
      isLoaded,
      setLoaded,
    }),
    [
      locale,
      t,
      tracks,
      links,
      siteData,
      loadContent,
      toggleLocale,
      theme,
      toggleTheme,
      setTheme,
      isLoaded,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useApp() {
  return useLocale();
}
