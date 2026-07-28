import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { readSiteData, writeSiteData } from "@/lib/site-data";
import type { SiteData } from "@/types/site";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await readSiteData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SiteData;
  await writeSiteData(body);
  return NextResponse.json({ ok: true });
}
