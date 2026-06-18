// Owner authentication. Credentials are sourced exclusively from env vars
// (OWNER_EMAIL / OWNER_PASSWORD). If either is missing the admin login fails
// closed — no defaults are baked into the source so the public repo never
// ships a working credential.
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SALT = "frontdesk-agents-owner-v2";

export function ownerConfigured(): boolean {
  return Boolean(process.env.OWNER_EMAIL && process.env.OWNER_PASSWORD);
}

export function ownerEmail(): string | null {
  return process.env.OWNER_EMAIL ?? null;
}

function ownerPassword(): string | null {
  return process.env.OWNER_PASSWORD ?? null;
}

export function sessionToken(): string | null {
  const email = ownerEmail();
  const password = ownerPassword();
  if (!email || !password) return null;
  return createHmac("sha256", SALT).update(`${email}:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = ownerEmail();
  const expectedPassword = ownerPassword();
  if (!expectedEmail || !expectedPassword) return false;
  return (
    safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) &&
    safeEqual(password, expectedPassword)
  );
}

export async function isOwner(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get("fd_owner")?.value;
  if (!got) return false;
  return safeEqual(got, expected);
}
