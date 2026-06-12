// Persistence layer with three tiers:
//   1. Vercel Blob (BLOB_READ_WRITE_TOKEN set) — durable across deployments.
//   2. /tmp on serverless without Blob — ephemeral but functional.
//   3. ./data locally — durable on disk for development.
// Blob paths are namespaced under a secret prefix derived from the RW token so
// records (names, phone numbers) are not at a guessable public URL.
import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import { put, head } from "@vercel/blob";

const DATA_DIR = process.env.VERCEL ? "/tmp/frontdesk-data" : path.join(process.cwd(), "data");

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPath(file: string) {
  const secret = createHash("sha256")
    .update(process.env.BLOB_READ_WRITE_TOKEN as string)
    .digest("hex")
    .slice(0, 16);
  return `frontdesk-${secret}/${file}`;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  if (blobEnabled()) {
    try {
      const meta = await head(blobPath(file));
      const res = await fetch(meta.url, { cache: "no-store" });
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    }
  }
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  if (blobEnabled()) {
    await put(blobPath(file), JSON.stringify(value), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2));
}

export type Booking = {
  id: string;
  name: string;
  service: string;
  datetime: string;
  phone: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  phone?: string;
  email?: string;
  business?: string;
  industry?: string;
  plan?: string;
  source: string;
  createdAt: string;
};

export async function listBookings(): Promise<Booking[]> {
  return readJson<Booking[]>("bookings.json", []);
}

export async function addBooking(b: Omit<Booking, "id" | "createdAt">): Promise<Booking> {
  const bookings = await listBookings();
  const booking: Booking = { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  bookings.unshift(booking);
  await writeJson("bookings.json", bookings.slice(0, 500));
  return booking;
}

export async function listLeads(): Promise<Lead[]> {
  return readJson<Lead[]>("leads.json", []);
}

export async function addLead(l: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  const leads = await listLeads();
  const lead: Lead = { ...l, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  leads.unshift(lead);
  await writeJson("leads.json", leads.slice(0, 1000));
  return lead;
}
