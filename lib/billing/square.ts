// Square Subscriptions API wrapper. We talk to Square via plain fetch to avoid
// pulling in the heavyweight `square` SDK. The merchant creates a Subscription
// Plan + Variation in the Square Dashboard once, then puts the variation IDs
// into env vars (SQUARE_PLAN_STARTER, SQUARE_PLAN_PROFESSIONAL, SQUARE_PLAN_GROWTH).
// On checkout we create / find a Customer, then create a Subscription. Square
// invoices the customer automatically each cycle.

const ENV = (process.env.SQUARE_ENVIRONMENT || "production").toLowerCase();
const BASE = ENV === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";
const VERSION = "2025-01-23";

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

function headers() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "Square-Version": VERSION,
  };
}

async function squareFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers(), ...(init.headers || {}) } });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // leave data null
  }
  if (!res.ok) {
    const errors = (data as { errors?: Array<{ detail?: string; code?: string }> } | null)?.errors;
    const message = errors?.[0]?.detail || `Square API ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

type SquareCustomer = { id: string; email_address?: string };
type SquareSubscription = { id: string; status: string; invoice_ids?: string[]; charged_through_date?: string };

export async function findOrCreateCustomer(email: string, name?: string): Promise<SquareCustomer> {
  const search = await squareFetch<{ customers?: SquareCustomer[] }>("/v2/customers/search", {
    method: "POST",
    body: JSON.stringify({
      query: { filter: { email_address: { exact: email } } },
      limit: 1,
    }),
  });
  if (search.customers && search.customers.length > 0) return search.customers[0];

  const [given, ...rest] = (name ?? "").split(/\s+/).filter(Boolean);
  const created = await squareFetch<{ customer: SquareCustomer }>("/v2/customers", {
    method: "POST",
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      email_address: email,
      given_name: given || undefined,
      family_name: rest.join(" ") || undefined,
    }),
  });
  return created.customer;
}

export async function createSubscription(input: {
  customerId: string;
  planVariationId: string;
}): Promise<SquareSubscription> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID not set");
  const result = await squareFetch<{ subscription: SquareSubscription }>("/v2/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      location_id: locationId,
      plan_variation_id: input.planVariationId,
      customer_id: input.customerId,
    }),
  });
  return result.subscription;
}

export async function retrieveSubscription(subscriptionId: string): Promise<SquareSubscription> {
  const result = await squareFetch<{ subscription: SquareSubscription }>(
    `/v2/subscriptions/${subscriptionId}`,
    { method: "GET" }
  );
  return result.subscription;
}

export function mapSquareStatus(status: string): "active" | "trialing" | "past_due" | "canceled" | "incomplete" {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "PENDING":
      return "incomplete";
    case "PAUSED":
      return "past_due";
    case "DEACTIVATED":
    case "CANCELED":
      return "canceled";
    default:
      return "incomplete";
  }
}
