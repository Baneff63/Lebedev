import type { Content, Locale } from "@/lib/i18n/content";
import { content, links as defaultLinks } from "@/lib/i18n/content";

export type TrackPlatforms = {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  soundcloud?: string;
};

export type TrackCategory = "mixed" | "beats" | "personal";

export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  genre?: string;
  tools?: string[];
  platforms?: TrackPlatforms;
  category: TrackCategory;
};

export type SiteLinks = {
  telegram: string;
  email: string;
  emailLabel: string;
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
};

export type ToolStackItem = {
  id: string;
  name: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  date: string; // ISO yyyy-mm-dd
  published: boolean;
  coverVariant: 0 | 1 | 2 | 3;
  ru: { title: string; excerpt: string; content: string };
  en: { title: string; excerpt: string; content: string };
};

export type SiteData = {
  tracks: Track[];
  posts: BlogPost[];
  toolsStack: ToolStackItem[];
  ru: Content;
  en: Content;
  links: SiteLinks;
};

export type LocaleContent = SiteData[Locale];

export function getDefaultSiteData(): SiteData {
  return {
    tracks: [],
    posts: [],
    toolsStack: [
      { id: "1", name: "FL Studio" },
      { id: "2", name: "Cubase" },
      { id: "3", name: "Waves" },
      { id: "4", name: "Fabfilter" },
    ],
    ru: structuredClone(content.ru) as Content,
    en: structuredClone(content.en) as Content,
    links: { ...defaultLinks },
  };
}

export function trackCategory(track: Track): TrackCategory {
  return track.category ?? "mixed";
}
