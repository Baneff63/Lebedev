import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "baneoff_admin";

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD ?? "baneoff";
}

export function createAdminToken(): string {
  return createHmac("sha256", getAdminSecret())
    .update("baneoff-admin-session")
    .digest("hex");
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createAdminToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function verifyPassword(password: string): boolean {
  return password === getAdminSecret();
}
