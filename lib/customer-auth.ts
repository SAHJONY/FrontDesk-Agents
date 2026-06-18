// Customer self-service authentication. Passwords live in their own Blob file
// (customerId → scrypt hash) so the Customer record shape stays untouched.
// Session cookie: `${customerId}.${hmac}` — verifiable without a DB lookup.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { put, head } from "@vercel/blob";
import { getCustomerByEmail, upsertCustomerByEmail, type Customer } from "@/lib/store";

const DATA_DIR = process.env.VERCEL ? "/tmp/frontdesk-data" : path.join(process.cwd(), "data");
const FILE = "customer-passwords.json";
const COOKIE = "fd_customer";

function sessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN || "fd-customer-dev";
}

async function readHashes(): Promise<Record<string, string>> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const meta = await head(`auth/${FILE}`);
      const res = await fetch(meta.url, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {
      /* first run */
    }
    return {};
  }
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, FILE), "utf8"));
  } catch {
    return {};
  }
}

async function writeHashes(h: Record<string, string>) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(`auth/${FILE}`, JSON.stringify(h), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, FILE), JSON.stringify(h));
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function sessionTokenFor(customerId: string): string {
  const sig = createHmac("sha256", sessionSecret()).update(`cust:${customerId}`).digest("hex").slice(0, 32);
  return `${customerId}.${sig}`;
}

export async function customerFromCookies(): Promise<Customer | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || sessionTokenFor(id) !== raw) return null;
  const { listCustomers } = await import("@/lib/store");
  const customers = await listCustomers();
  return customers.find((c) => c.id === id) ?? null;
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  name?: string;
  business?: string;
}): Promise<{ ok: true; customer: Customer } | { ok: false; error: string }> {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) return { ok: false, error: "Valid email required" };
  if ((input.password ?? "").length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  const existing = await getCustomerByEmail(input.email);
  const hashes = await readHashes();
  if (existing && hashes[existing.id]) return { ok: false, error: "Account already exists — sign in instead" };
  const customer = await upsertCustomerByEmail({ email: input.email, name: input.name, business: input.business });
  hashes[customer.id] = hashPassword(input.password);
  await writeHashes(hashes);
  return { ok: true, customer };
}

export async function loginCustomer(email: string, password: string): Promise<Customer | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;
  const hashes = await readHashes();
  const stored = hashes[customer.id];
  if (!stored || !verifyPassword(password, stored)) return null;
  return customer;
}

export const CUSTOMER_COOKIE = COOKIE;
