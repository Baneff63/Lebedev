import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { ToolsShowcase } from "@/components/sections/ToolsShowcase";

export const metadata: Metadata = { title: "Контакт" };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24 md:pt-28">
        <ToolsShowcase />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
