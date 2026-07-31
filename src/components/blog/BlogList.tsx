"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

const COVER_CLASSES = ["work-blur-0", "work-blur-1", "work-blur-2", "work-blur-3"];

export function BlogList() {
  const { t, locale, siteData } = useLocale();
  const posts = (siteData?.posts ?? [])
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const headlineLines = t.blog.headline.split("\n");

  return (
    <section className="mx-auto w-full max-w-[1440px]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{t.blog.label}</p>
      <h1 className="mt-6 max-w-[600px] font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
        {headlineLines.map((line, i) => (
          <span key={line} className={i === 1 ? "block italic text-accent" : "block"}>
            {line}
          </span>
        ))}
      </h1>
      <p className="mt-4 max-w-[440px] text-[15px] text-muted">{t.blog.body}</p>

      {posts.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-ink/12 py-16 text-center">
          <p className="text-muted">{t.blog.empty}</p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              data-cursor
              className="group overflow-hidden rounded-2xl border border-ink/10 transition-colors hover:border-accent/40"
            >
              <div className={`h-40 ${COVER_CLASSES[post.coverVariant] ?? COVER_CLASSES[0]}`} />
              <div className="p-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                  {t.blog.publishedOn} {new Date(post.date).toLocaleDateString(locale)}
                </p>
                <p className="mt-2 font-display text-xl text-ink group-hover:text-accent">
                  {post[locale].title}
                </p>
                <p className="mt-2 line-clamp-2 text-[14px] text-muted">{post[locale].excerpt}</p>
                <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] text-accent">
                  {t.blog.readMore} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
