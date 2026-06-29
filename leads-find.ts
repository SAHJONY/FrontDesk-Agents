// lib/leads-find.ts
// Google Places API (NEW) discovery + enrichment for the autonomous lead engine.
//
// Contract expected by app/api/admin/leads-find/route.ts:
//   findLeads({ lat?, lng?, keyword?, radius?, locationText? })
//       -> { status, data: { keyword, leads: Lead[] } }
//   lookupBusiness(name, address)
//       -> { status, data: Business | { error } }
//
// Why Places API (NEW): one searchText call returns websiteUri + phone via the
// field mask, so we do NOT need a Place Details call per result. That fixes:
//   • saves persisting 0 leads (phone now present, so email||phone passes)
//   • everyone being mislabeled "needsSite" (we actually see the website)
//   • cost blowups (1 billed call per search instead of 1 + N details)
//
// Setup: enable "Places API (New)" in Google Cloud (distinct from legacy
// "Places API"); GOOGLE_PLACES_API_KEY must be UNrestricted for referrers
// (server-side calls have no referer) — IP restriction is fine.

const PLACES_BASE = "https://places.googleapis.com/v1";

// Fields we ask Google to return. Keep this tight — billing scales with the
// SKU tier of the fields requested.
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.primaryType",
  "places.types",
  "places.location",
  "places.googleMapsUri",
  "places.businessStatus",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "websiteUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "rating",
  "userRatingCount",
  "primaryType",
  "types",
  "location",
  "googleMapsUri",
  "regularOpeningHours",
  "editorialSummary",
].join(",");

export type Lead = {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string; // Places never returns email; left for downstream enrichment
  website: string;
  websiteKind: "none" | "social" | "builder" | "real";
  needsSite: boolean;
  rating?: number;
  reviewCount?: number;
  category?: string;
  lat?: number;
  lng?: number;
  mapsUri?: string;
  businessStatus?: string;
};

export type Business = Lead & {
  hours?: string[];
  summary?: string;
};

type Result<T> = { status: number; data: T };

function key(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY || null;
}

function host(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

// The qualification rule: does this business actually need a website?
function classifyWebsite(websiteUri?: string): {
  website: string;
  websiteKind: Lead["websiteKind"];
  needsSite: boolean;
} {
  if (!websiteUri) return { website: "", websiteKind: "none", needsSite: true };
  const h = host(websiteUri);
  // Social / aggregator / directory presence == not their own real site.
  if (/(facebook|instagram|linktr\.ee|linktree|yelp|tripadvisor|google\.|maps\.)/.test(h)) {
    return { website: websiteUri, websiteKind: "social", needsSite: true };
  }
  // Google's free "business.site" / similar builders == weak, still upsellable.
  if (/(business\.site|godaddysites|wixsite|weebly|square\.site)/.test(h)) {
    return { website: websiteUri, websiteKind: "builder", needsSite: true };
  }
  return { website: websiteUri, websiteKind: "real", needsSite: false };
}

function toLead(p: any): Lead {
  const cls = classifyWebsite(p.websiteUri);
  return {
    placeId: p.id,
    name: p.displayName?.text || "",
    address: p.formattedAddress || "",
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || undefined,
    website: cls.website,
    websiteKind: cls.websiteKind,
    needsSite: cls.needsSite,
    rating: typeof p.rating === "number" ? p.rating : undefined,
    reviewCount: typeof p.userRatingCount === "number" ? p.userRatingCount : undefined,
    category: p.primaryType || (Array.isArray(p.types) ? p.types[0] : undefined),
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    mapsUri: p.googleMapsUri,
    businessStatus: p.businessStatus,
  };
}

function clampRadius(r: unknown): number {
  const n = Number(r);
  if (!Number.isFinite(n)) return 5000;
  return Math.min(Math.max(n, 100), 50000); // Places allows up to 50km
}

async function searchText(
  textQuery: string,
  apiKey: string,
  opts: { lat?: number; lng?: number; radius?: number; max?: number } = {}
): Promise<Result<{ leads: Lead[] }>> {
  const body: Record<string, any> = {
    textQuery,
    maxResultCount: Math.min(opts.max ?? 20, 20),
    languageCode: "en",
  };
  if (typeof opts.lat === "number" && typeof opts.lng === "number") {
    body.locationBias = {
      circle: {
        center: { latitude: opts.lat, longitude: opts.lng },
        radius: clampRadius(opts.radius),
      },
    };
  }

  let r: Response;
  try {
    r = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { status: 502, data: { leads: [] } };
  }

  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    return {
      status: r.status,
      data: { leads: [], error: json?.error?.message || "Places searchText failed" } as any,
    };
  }
  const leads = Array.isArray(json.places) ? json.places.map(toLead) : [];
  return { status: 200, data: { leads } };
}

// NEARBY / KEYWORD discovery. Uses Text Search because it accepts a free-text
// keyword (e.g. "taqueria"), which Nearby Search (typed categories) cannot.
export async function findLeads(params: {
  lat?: number;
  lng?: number;
  keyword?: string;
  radius?: number;
  locationText?: string;
}): Promise<Result<{ keyword: string; leads: Lead[] }>> {
  const apiKey = key();
  if (!apiKey) {
    return { status: 500, data: { keyword: "", leads: [] } };
  }

  const keyword = String(params.keyword || "").slice(0, 120).trim();
  const locationText = String(params.locationText || "").slice(0, 200).trim();
  const hasCoords = typeof params.lat === "number" && typeof params.lng === "number";

  if (!keyword && !locationText && !hasCoords) {
    return { status: 400, data: { keyword: "", leads: [] } };
  }

  // Build the query: keyword + location text when present; coords go to bias.
  const textQuery = [keyword || "local business", locationText ? `in ${locationText}` : ""]
    .join(" ")
    .trim();

  const res = await searchText(textQuery, apiKey, {
    lat: params.lat,
    lng: params.lng,
    radius: params.radius,
  });

  if (res.status !== 200) {
    return { status: res.status, data: { keyword, leads: [] } };
  }
  return { status: 200, data: { keyword, leads: res.data.leads } };
}

// LOOKUP one specific business → enrich for builder pre-fill.
export async function lookupBusiness(
  name: string,
  address: string
): Promise<Result<Business | { error: string }>> {
  const apiKey = key();
  if (!apiKey) return { status: 500, data: { error: "GOOGLE_PLACES_API_KEY not set" } };

  const q = [name, address].filter(Boolean).join(" ").trim();
  if (!q) return { status: 400, data: { error: "name or address required" } };

  const search = await searchText(q, apiKey, { max: 1 });
  if (search.status !== 200) {
    return { status: search.status, data: { error: "lookup search failed" } };
  }
  const top = search.data.leads[0];
  if (!top) return { status: 404, data: { error: "no match found" } };

  // One Details call for richer pre-fill (hours, summary). Single business,
  // so the extra call is negligible.
  let hours: string[] | undefined;
  let summary: string | undefined;
  try {
    const dr = await fetch(`${PLACES_BASE}/places/${encodeURIComponent(top.placeId)}`, {
      method: "GET",
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": DETAILS_FIELD_MASK },
    });
    if (dr.ok) {
      const d = await dr.json();
      hours = d?.regularOpeningHours?.weekdayDescriptions;
      summary = d?.editorialSummary?.text;
    }
  } catch {
    /* details are optional */
  }

  return { status: 200, data: { ...top, hours, summary } };
}
