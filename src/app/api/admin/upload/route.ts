import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { getUploadsDir } from "@/lib/site-data";

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  if (file.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 30MB" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".mp3";
  const safeName = `${randomUUID()}${ext.toLowerCase()}`;
  const dir = getUploadsDir();
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safeName), buffer);

  return NextResponse.json({ src: `/uploads/audio/${safeName}` });
}
