import type { Metadata } from "next";
import { Fraunces, Inter_Tight, Literata } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ThemeScript } from "@/components/ui/ThemeScript";
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
  title: "baneoff — sound producer",
  description:
    "Лебедев Даниил. Sound producer. Стабильно лучше — без лишнего шума.",
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
