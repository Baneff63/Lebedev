import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, Literata } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ThemeScript } from "@/components/ui/ThemeScript";
import { content, siteUrl } from "@/lib/i18n/content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: content.ru.meta.title,
    template: "%s — baneoff",
  },
  description: content.ru.meta.description,
  keywords: [
    "сведение треков",
    "мастеринг треков",
    "mixing engineer",
    "mastering engineer",
    "звукорежиссер",
    "baneoff",
  ],
  authors: [{ name: "Даниил Лебедев" }],
  creator: "Даниил Лебедев",
  alternates: {
    canonical: siteUrl,
    languages: {
      ru: siteUrl,
      en: siteUrl,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "baneoff",
    title: content.ru.meta.title,
    description: content.ru.meta.description,
    locale: "ru_RU",
    alternateLocale: "en_US",
        images: [
      {
        url: "/og-image.png",          // ← путь к картинке в public/
        width: 1200,
        height: 630,
        alt: "baneoff — сведение и мастеринг",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: content.ru.meta.title,
    description: content.ru.meta.description,
        images: ["/og-image.png"],          // ← для Twitter тоже отдельно
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2ede3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-theme="light"
      suppressHydrationWarning
      className={`${fraunces.variable} ${literata.variable} ${interTight.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-paper font-body text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}