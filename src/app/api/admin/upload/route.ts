import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";

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

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "mp3";
  const safeName = `audio/${randomUUID()}.${ext?.toLowerCase() ?? "mp3"}`;

  const blob = await put(safeName, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || "audio/mpeg",
  });

  return NextResponse.json({ src: blob.url });
}
