import type { Content, Locale } from "@/lib/i18n/content";
import { content, links as defaultLinks } from "@/lib/i18n/content";

export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

export type SiteLinks = {
  telegram: string;
  email: string;
  emailLabel: string;
};

export type SiteData = {
  tracks: Track[];
  ru: Content;
  en: Content;
  links: SiteLinks;
};

export type LocaleContent = SiteData[Locale];

export function getDefaultSiteData(): SiteData {
  return {
    tracks: [],
    ru: structuredClone(content.ru) as Content,
    en: structuredClone(content.en) as Content,
    links: { ...defaultLinks },
  };
}
