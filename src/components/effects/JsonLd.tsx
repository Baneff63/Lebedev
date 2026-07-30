import { content, links, siteUrl } from "@/lib/i18n/content";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Daniil Lebedev",
        alternateName: "baneoff",
        url: siteUrl,
        jobTitle: "Mixing & Mastering Engineer",
        description: content.en.meta.description,
        email: links.email.replace("mailto:", ""),
        sameAs: [links.telegram, links.instagram, links.soundcloud, links.spotify].filter(
          Boolean,
        ),
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "baneoff — Mixing & Mastering",
        url: siteUrl,
        description: content.en.meta.description,
        provider: { "@id": `${siteUrl}/#person` },
        areaServed: "Worldwide",
        serviceType: ["Audio mixing", "Audio mastering", "Music production"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "baneoff",
        inLanguage: ["ru", "en"],
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
