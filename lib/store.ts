// Lightweight persistence that is safe on serverless: writes land in /tmp
// (ephemeral on Vercel, durable locally). The dashboard merges these records
// with seeded demo data, so an empty store still renders a rich view.
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL ? "/tmp/frontdesk-data" : path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
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
