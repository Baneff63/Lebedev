import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { readSiteData } from "@/lib/site-data";
import { BlogPostBody } from "@/components/blog/BlogPostBody";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await readSiteData();
  const post = data.posts.find((p) => p.slug === slug && p.published);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="px-5 pt-32 pb-20 md:px-10 md:pt-40 md:pb-32">
        <article className="mx-auto w-full max-w-[720px]">
          <Link
            href="/blog"
            className="text-[11px] uppercase tracking-[0.14em] text-muted hover:text-accent"
          >
            ← Все посты
          </Link>
          <BlogPostBody post={post} />
        </article>
      </main>
      <Footer />
    </>
  );
}
