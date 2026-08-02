"use client";

import { useLocale } from "@/context/LocaleContext";
import { ToolsStack } from "@/components/effects/ToolsStack";

export function ToolsShowcase() {
  const { t, siteData } = useLocale();
  const tools = siteData?.toolsStack ?? [];
  const headlineLines = t.contactPage.toolsHeadline.split("\n");

  return (
    <section className="border-t border-ink/8 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          {t.contactPage.toolsLabel}
        </p>
        <h2 className="mx-auto mt-6 max-w-[560px] font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] tracking-[-0.02em] text-ink">
          {headlineLines.map((line, i) => (
            <span key={line} className={i === 1 ? "block italic text-accent" : "block"}>
              {line}
            </span>
          ))}
        </h2>
        <div className="mt-14 md:h-[380px]">
          <ToolsStack tools={tools} />
        </div>
      </div>
    </section>
  );
}
