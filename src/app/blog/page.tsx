import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = { title: "Блог" };

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="px-5 pt-32 pb-20 md:px-10 md:pt-40 md:pb-32">
        <BlogList />
      </main>
      <Footer />
    </>
  );
}
