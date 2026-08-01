"use client";

import { useLocale } from "@/context/LocaleContext";
import type { BlogPost } from "@/types/site";

export function BlogPostBody({ post }: { post: BlogPost }) {
  const { locale } = useLocale();
  const p = post[locale];
  const paragraphs = p.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        {new Date(post.date).toLocaleDateString(locale)}
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
        {p.title}
      </h1>
      <div className="mt-10 space-y-5 text-[15px] leading-[1.8] text-ink/85">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
