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

// ---------- Bookings & leads (existing) -------------------------------------

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

// ---------- Customers & subscriptions ---------------------------------------

export type Customer = {
  id: string;
  email: string;
  name?: string;
  business?: string;
  createdAt: string;
};

export type SubProvider = "stripe" | "square" | "paypal";
export type SubStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete";

export type Subscription = {
  id: string;
  customerId: string;
  planId: string;
  provider: SubProvider;
  providerSubId: string;       // Stripe sub id / Square sub id / PayPal sub id
  providerCustomerId?: string; // Stripe customer id / Square customer id / PayPal payer id
  status: SubStatus;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
};

const CUSTOMERS_FILE = "customers.json";
const SUBSCRIPTIONS_FILE = "subscriptions.json";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listCustomers(): Promise<Customer[]> {
  return readJson<Customer[]>(CUSTOMERS_FILE, []);
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const customers = await listCustomers();
  const e = normalizeEmail(email);
  return customers.find((c) => c.email === e) ?? null;
}

export async function upsertCustomerByEmail(input: {
  email: string;
  name?: string;
  business?: string;
}): Promise<Customer> {
  const customers = await listCustomers();
  const email = normalizeEmail(input.email);
  const existing = customers.find((c) => c.email === email);
  if (existing) {
    existing.name = input.name ?? existing.name;
    existing.business = input.business ?? existing.business;
    await writeJson(CUSTOMERS_FILE, customers);
    return existing;
  }
  const customer: Customer = {
    id: crypto.randomUUID(),
    email,
    name: input.name,
    business: input.business,
    createdAt: new Date().toISOString(),
  };
  customers.unshift(customer);
  await writeJson(CUSTOMERS_FILE, customers.slice(0, 5000));
  return customer;
}

export async function listSubscriptions(): Promise<Subscription[]> {
  return readJson<Subscription[]>(SUBSCRIPTIONS_FILE, []);
}

export async function getSubscriptionByProvider(
  provider: SubProvider,
  providerSubId: string
): Promise<Subscription | null> {
  const subs = await listSubscriptions();
  return subs.find((s) => s.provider === provider && s.providerSubId === providerSubId) ?? null;
}

export async function getActiveSubscriptionForCustomer(customerId: string): Promise<Subscription | null> {
  const subs = await listSubscriptions();
  return (
    subs.find((s) => s.customerId === customerId && (s.status === "active" || s.status === "trialing")) ?? null
  );
}

export async function upsertSubscription(input: {
  customerId: string;
  planId: string;
  provider: SubProvider;
  providerSubId: string;
  providerCustomerId?: string;
  status: SubStatus;
  currentPeriodEnd?: string;
}): Promise<Subscription> {
  const subs = await listSubscriptions();
  const now = new Date().toISOString();
  const existing = subs.find(
    (s) => s.provider === input.provider && s.providerSubId === input.providerSubId
  );
  if (existing) {
    existing.customerId = input.customerId;
    existing.planId = input.planId;
    existing.status = input.status;
    existing.currentPeriodEnd = input.currentPeriodEnd ?? existing.currentPeriodEnd;
    existing.providerCustomerId = input.providerCustomerId ?? existing.providerCustomerId;
    existing.updatedAt = now;
    await writeJson(SUBSCRIPTIONS_FILE, subs);
    return existing;
  }
  const sub: Subscription = {
    id: crypto.randomUUID(),
    customerId: input.customerId,
    planId: input.planId,
    provider: input.provider,
    providerSubId: input.providerSubId,
    providerCustomerId: input.providerCustomerId,
    status: input.status,
    currentPeriodEnd: input.currentPeriodEnd,
    createdAt: now,
    updatedAt: now,
  };
  subs.unshift(sub);
  await writeJson(SUBSCRIPTIONS_FILE, subs.slice(0, 10000));
  return sub;
}

// ---------- Usage tracking (chat caps) --------------------------------------

export type UsageRecord = { customerId: string; periodKey: string; count: number };

const USAGE_FILE = "usage.json";

// Period key = YYYY-MM (UTC). Resets on month boundary.
export function currentPeriodKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function incrementUsage(customerId: string): Promise<number> {
  const records = await readJson<UsageRecord[]>(USAGE_FILE, []);
  const key = currentPeriodKey();
  const existing = records.find((r) => r.customerId === customerId && r.periodKey === key);
  if (existing) {
    existing.count += 1;
  } else {
    records.unshift({ customerId, periodKey: key, count: 1 });
  }
  // Garbage-collect anything older than 6 months.
  const cutoff = new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 6);
  const cutoffKey = currentPeriodKey(cutoff);
  const trimmed = records.filter((r) => r.periodKey >= cutoffKey);
  await writeJson(USAGE_FILE, trimmed);
  return existing ? existing.count : 1;
}

export async function getUsage(customerId: string): Promise<number> {
  const records = await readJson<UsageRecord[]>(USAGE_FILE, []);
  const key = currentPeriodKey();
  return records.find((r) => r.customerId === customerId && r.periodKey === key)?.count ?? 0;
}
