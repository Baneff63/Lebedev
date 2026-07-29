import { put, head } from "@vercel/blob";
import { getDefaultSiteData, type SiteData } from "@/types/site";

const BLOB_PATH = "site-data.json";

export async function readSiteData(): Promise<SiteData> {
  try {
    const blob = await head(BLOB_PATH);
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    return (await res.json()) as SiteData;
  } catch {
    const defaults = getDefaultSiteData();
    await writeSiteData(defaults);
    return defaults;
  }
}

export async function writeSiteData(data: SiteData): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
}