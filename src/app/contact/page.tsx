import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
import { ContactScreen } from "@/components/sections/ContactScreen";

export const metadata: Metadata = { title: "Контакт" };

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="app-shell-main h-dvh overflow-hidden pt-20 md:pt-24">
        <ContactScreen />
      </main>

      <SiteFooterBar />
    </>
  );
}
