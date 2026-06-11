// Owner authentication. Credentials come from env (OWNER_EMAIL / OWNER_PASSWORD)
// with the platform owner's defaults baked in so the admin works out of the box.
// The session cookie carries an HMAC of the credentials, never the password.
import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SALT = "frontdesk-agents-owner-v1";

export function ownerEmail() {
  return process.env.OWNER_EMAIL || "sahjonycapitalllc@outlook.com";
}

function ownerPassword() {
  return process.env.OWNER_PASSWORD || "Primelles308#";
}

export function sessionToken() {
  return createHmac("sha256", SALT).update(`${ownerEmail()}:${ownerPassword()}`).digest("hex");
}

export function verifyCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ownerEmail().toLowerCase() && password === ownerPassword();
}

export async function isOwner(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("fd_owner")?.value === sessionToken();
}
