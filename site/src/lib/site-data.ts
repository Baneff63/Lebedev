import { promises as fs } from "fs";
import path from "path";
import { getDefaultSiteData, type SiteData } from "@/types/site";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site.json");

export async function readSiteData(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as SiteData;
  } catch {
    const defaults = getDefaultSiteData();
    await writeSiteData(defaults);
    return defaults;
  }
}

export async function writeSiteData(data: SiteData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getUploadsDir() {
  return path.join(process.cwd(), "public", "uploads", "audio");
}
