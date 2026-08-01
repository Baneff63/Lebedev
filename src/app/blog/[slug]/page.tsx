import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SiteFooterBar } from "@/components/layout/SiteFooterBar";
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

      <main className="app-shell-main h-dvh overflow-hidden pt-20 md:pt-24">
        <div className="mx-auto flex h-full w-full max-w-[720px] flex-col px-5 md:px-10">
          <div className="shrink-0 pt-6 md:pt-10">
            <Link
              href="/blog"
              className="text-[11px] uppercase tracking-[0.14em] text-muted hover:text-accent"
            >
              ← Все посты
            </Link>
          </div>

          <div className="thin-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto pb-10">
            <BlogPostBody post={post} />
          </div>
        </div>
      </main>

      <SiteFooterBar />
    </>
  );
}
