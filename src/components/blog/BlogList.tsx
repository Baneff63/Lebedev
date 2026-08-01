"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

const COVER_CLASSES = ["work-blur-0", "work-blur-1", "work-blur-2", "work-blur-3"];

export function BlogList() {
  const { t, locale, siteData } = useLocale();
  const posts = (siteData?.posts ?? [])
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (posts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-ink/12 text-center">
        <p className="max-w-[360px] text-muted">{t.blog.empty}</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
      {/* Featured post — the latest one, given more visual weight */}
      <Link
        href={`/blog/${featured.slug}`}
        data-cursor
        className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-ink/10 transition-colors hover:border-accent/40 md:col-span-7"
      >
        <div
          className={`relative h-[42%] min-h-[140px] ${
            COVER_CLASSES[featured.coverVariant] ?? COVER_CLASSES[0]
          }`}
        >
          <span className="absolute top-4 left-4 rounded-full border border-on-dark/25 bg-paper/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-on-dark backdrop-blur-sm">
            {t.blog.publishedOn} {new Date(featured.date).toLocaleDateString(locale)}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <p className="font-display text-2xl leading-tight text-ink group-hover:text-accent md:text-3xl">
            {featured[locale].title}
          </p>
          <p className="mt-3 max-w-[440px] text-[14px] leading-[1.7] text-muted">
            {featured[locale].excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-accent">
            {t.blog.readMore} →
          </span>
        </div>
      </Link>

      {/* Rest of the posts — a compact, internally-scrolling list */}
      <div className="thin-scrollbar min-h-0 overflow-y-auto md:col-span-5">
        {rest.length === 0 ? (
          <p className="py-6 text-[13px] text-muted/60">{t.blog.back.replace("← ", "")} —</p>
        ) : (
          <div className="flex flex-col divide-y divide-ink/8">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                data-cursor
                className="group flex items-start justify-between gap-4 py-5 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted/60">
                    {new Date(post.date).toLocaleDateString(locale)}
                  </p>
                  <p className="mt-1 truncate font-display text-lg text-ink group-hover:text-accent">
                    {post[locale].title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[13px] text-muted">
                    {post[locale].excerpt}
                  </p>
                </div>
                <span className="mt-1 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
