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
  /** Optional link to the tool's website — makes the item on the 3D
   * ellipse clickable (opens in a new tab). Left empty, the item is
   * shown but isn't interactive. */
  url?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  date: string; // ISO yyyy-mm-dd
  published: boolean;
  /** Fallback gradient cover, used only when coverImage isn't set. */
  coverVariant: 0 | 1 | 2 | 3;
  /**
   * Optional uploaded cover image URL (Vercel Blob). Always displayed at
   * a fixed 16:9 aspect ratio with object-cover, so any uploaded image —
   * regardless of its original dimensions — looks consistent across the
   * blog list and post page. Recommended source size: 1200×675px.
   */
  coverImage?: string;
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
      { id: "1", name: "FL Studio", url: "" },
      { id: "2", name: "Cubase", url: "" },
      { id: "3", name: "Waves", url: "" },
      { id: "4", name: "Fabfilter", url: "" },
    ],
    ru: structuredClone(content.ru) as Content,
    en: structuredClone(content.en) as Content,
    links: { ...defaultLinks },
  };
}

export function trackCategory(track: Track): TrackCategory {
  return track.category ?? "mixed";
}
