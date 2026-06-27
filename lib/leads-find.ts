// Autonomous lead engine (Phase 3). Discovers businesses via the Google Places
// API (official, licensed) and enriches them from the prospect's OWN public
// website (email, about, social links, embedded media) + Google's official
// Places photos. Ported from the factory's api/leads-find.js.
//
// Compliance: this NEVER logs into or scrapes inside Instagram/TikTok/Facebook/
// etc. It collects social profile *links* and media the business already
// publishes on its own site, plus Google's licensed Places photos. Copying media
// out of third-party social platforms into a customer site is intentionally NOT
// done here — owners add their own media (with consent) via their console.
import { loadFactorySecrets } from "@/lib/site-store";

const PLACES = "https://places.googleapis.com/v1";

export async function placesConfigured(): Promise<boolean> {
  if (process.env.GOOGLE_PLACES_API_KEY) return true;
  const s = await loadFactorySecrets();
  return Boolean(s.GOOGLE_PLACES_API_KEY);
}

async function placesKey(): Promise<string> {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY;
  return (await loadFactorySecrets()).GOOGLE_PLACES_API_KEY || "";
}

// ---- HTML extraction helpers (read the prospect's own site) -----------------

function extractEmail(html: string): string {
  const out: string[] = [];
  const mailto = html.match(/mailto:([^"'?>\s]+@[^"'?>\s]+)/i);
  if (mailto) out.push(mailto[1]);
  out.push(...(html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
  for (const c of out) {
    const e = c.toLowerCase().trim().replace(/[.,;]+$/, "");
    if (/\.(png|jpe?g|gif|webp|svg|css|js|ico)$/.test(e)) continue;
    if (/(example|sentry|wixpress|\.wix|@2x|@3x|godaddy|squarespace|yourdomain|domain\.com|email@|name@|user@)/.test(e)) continue;
    return e;
  }
  return "";
}

async function grab(u: string, ms: number): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(u, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (compatible; FrontDeskLeadBot/1.0)" } });
    if (!r.ok) return "";
    return (await r.text()).slice(0, 800000);
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

async function scrapeEmail(website: string): Promise<string> {
  let email = extractEmail(await grab(website, 3500));
  if (!email) {
    try {
      email = extractEmail(await grab(new URL(website).origin + "/contact", 3500));
    } catch {
      /* ignore */
    }
  }
  return email;
}

function extractAbout(html: string): string {
  const meta =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{20,})["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']{20,})["'][^>]+name=["']description["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{20,})["']/i);
  if (meta) return meta[1].replace(/\s+/g, " ").trim().slice(0, 500);
  for (const block of html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []) {
    const text = block.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
    if (text.length >= 60) return text.slice(0, 500);
  }
  return "";
}

function absUrl(base: string, u: string): string {
  try {
    return new URL(u, base).href;
  } catch {
    return "";
  }
}

function extractSocial(html: string): Record<string, string> {
  const social: Record<string, string> = {};
  const want: [string, RegExp][] = [
    ["facebook", /(?:facebook|fb)\.com\/(?!sharer|plugins|tr\b|dialog)/i],
    ["instagram", /instagram\.com\/(?!p\/|reel\/)/i],
    ["tiktok", /tiktok\.com\/@/i],
    ["youtube", /(?:youtube\.com\/(?:channel\/|c\/|user\/|@)|youtu\.be\/)/i],
    ["x", /(?:twitter\.com|x\.com)\/(?!intent|share|home)/i],
    ["linkedin", /linkedin\.com\/(?:company|in|school)\//i],
    ["whatsapp", /(?:wa\.me\/|api\.whatsapp\.com\/send)/i],
  ];
  const re = /https?:\/\/[^"'\s)<>]+/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const url = m[0].replace(/[\\"'<>].*$/, "");
    for (const [k, rx] of want) if (!social[k] && rx.test(url)) social[k] = url;
  }
  return social;
}

function extractSiteMedia(html: string, base: string): { images: string[]; videos: string[]; audios: string[] } {
  const images: string[] = [], videos: string[] = [], audios: string[] = [];
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) { const u = absUrl(base, og[1]); if (u) images.push(u); }
  let m: RegExpExecArray | null;
  let re = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = re.exec(html)) && images.length < 8) {
    const u = absUrl(base, m[1]);
    if (!u || /^data:/.test(u)) continue;
    if (/\.(svg|gif)(\?|$)/i.test(u)) continue;
    if (/(sprite|icon|logo|favicon|pixel|spacer|blank|1x1|placeholder|avatar|badge|loader)/i.test(u)) continue;
    if (!images.includes(u)) images.push(u);
  }
  re = /https?:\/\/[^"'\s)<>]+/gi;
  while ((m = re.exec(html))) {
    const u = m[0].replace(/[\\"'<>].*$/, "");
    if (videos.length < 2 && /(youtube\.com\/watch|youtu\.be\/|player\.vimeo\.com|vimeo\.com\/\d+|\.mp4(\?|$))/i.test(u) && !videos.includes(u)) videos.push(u);
    if (audios.length < 1 && /\.(mp3|m4a)(\?|$)/i.test(u) && !audios.includes(u)) audios.push(u);
  }
  return { images, videos, audios };
}

type SiteScrape = { email: string; about: string; social: Record<string, string>; images: string[]; videos: string[]; audios: string[] };

async function scrapeSite(website: string): Promise<SiteScrape> {
  const empty: SiteScrape = { email: "", about: "", social: {}, images: [], videos: [], audios: [] };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch(website, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (compatible; FrontDeskLeadBot/1.0)" } });
    if (!r.ok) return empty;
    const base = r.url || website;
    const html = (await r.text()).slice(0, 800000);
    let email = extractEmail(html);
    if (!email) { try { email = await scrapeEmail(new URL(base).origin + "/contact"); } catch { /* ignore */ } }
    const media = extractSiteMedia(html, base);
    return { email, about: extractAbout(html), social: extractSocial(html), images: media.images, videos: media.videos, audios: media.audios };
  } catch {
    return empty;
  } finally {
    clearTimeout(t);
  }
}

// Official Google Places photos → public CDN URLs (no key exposed). Licensed for display.
async function placePhotoUrls(key: string, photos: { name?: string }[] | undefined, max: number): Promise<string[]> {
  const list = (photos || []).slice(0, max || 6).filter((ph) => ph && ph.name);
  const results = await Promise.all(list.map(async (ph) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch(`${PLACES}/${ph.name}/media?maxWidthPx=1280&skipHttpRedirect=true`, { signal: ctrl.signal, headers: { "X-Goog-Api-Key": key } });
      clearTimeout(t);
      if (!r.ok) return "";
      const j = await r.json();
      return j?.photoUri || "";
    } catch {
      return "";
    }
  }));
  return results.filter(Boolean);
}

function humanizeType(types: string[] | undefined): string {
  const SKIP = new Set(["point_of_interest", "establishment", "store", "food", "premise", "geocode", "health"]);
  const t = (types || []).find((x) => !SKIP.has(x)) || (types || [])[0] || "";
  return t ? t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}

function cityFrom(components: { types?: string[]; longText?: string; shortText?: string }[] | undefined, formatted: string): string {
  const find = (type: string) => {
    const c = (components || []).find((x) => (x.types || []).includes(type));
    return c ? c.longText || c.shortText || "" : "";
  };
  const parts = [find("locality") || find("postal_town") || find("sublocality"), find("administrative_area_level_1"), find("country")].filter(Boolean);
  if (parts.length) return parts.join(", ");
  const segs = String(formatted || "").split(",").map((s) => s.trim()).filter(Boolean);
  return segs.length > 2 ? segs.slice(1).join(", ") : segs[segs.length - 1] || "";
}

// ---- Public API -------------------------------------------------------------

export type FindResult = { status: number; data: Record<string, unknown> };

// NEARBY: discover prospects by area/keyword. No-website businesses first.
export async function findLeads(input: { lat?: number; lng?: number; keyword?: string; radius?: number; locationText?: string }): Promise<FindResult> {
  const key = await placesKey();
  if (!key) return { status: 500, data: { error: "Set GOOGLE_PLACES_API_KEY to use the lead finder." } };

  const lat = Number(input.lat), lng = Number(input.lng);
  const hasGeo = isFinite(lat) && isFinite(lng);
  const locationText = String(input.locationText || "").slice(0, 120).trim();
  if (!hasGeo && !locationText) return { status: 400, data: { error: "Provide lat/lng or a locationText (city/area)." } };

  const keyword = String(input.keyword || "").slice(0, 60);
  const radius = Math.min(50000, Math.max(500, Number(input.radius) || 4000));
  const baseTerm = keyword || "local business";
  const textQuery = hasGeo ? baseTerm : `${baseTerm} in ${locationText}`;
  const reqBody: Record<string, unknown> = { textQuery, maxResultCount: 12 };
  if (hasGeo) reqBody.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius } };

  try {
    const r = await fetch(`${PLACES}/places:searchText`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.rating,places.userRatingCount",
      },
      body: JSON.stringify(reqBody),
    });
    const j = await r.json();
    if (!r.ok) return { status: 502, data: { error: "Places error: " + (j?.error?.message || j?.error?.status || `HTTP ${r.status}`) } };

    const leads = (j.places || []).map((p: any) => ({
      name: p.displayName?.text || "(unnamed)",
      address: p.formattedAddress || "",
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "",
      email: "",
      website: p.websiteUri || "",
      mapsUrl: p.googleMapsUri || "",
      status: p.businessStatus || "",
      needsSite: !p.websiteUri,
      rating: p.rating || null,
      reviews: p.userRatingCount || 0,
      placeId: p.id,
    }));

    await Promise.all(leads.map(async (l: any) => {
      if (l.website) { try { l.email = await scrapeEmail(l.website); } catch { /* ignore */ } }
    }));

    leads.sort((a: any, b: any) => (a.needsSite === b.needsSite ? 0 : a.needsSite ? -1 : 1));
    return { status: 200, data: { leads, keyword } };
  } catch (e) {
    return { status: 500, data: { error: e instanceof Error ? e.message : "Request failed" } };
  }
}

// LOOKUP: research ONE named business (name + address) → full enriched profile
// the website builder can design from (Google data + official photos + the
// prospect's own-site about/social/media).
export async function lookupBusiness(name: string, address: string): Promise<FindResult> {
  const key = await placesKey();
  if (!key) return { status: 500, data: { error: "Set GOOGLE_PLACES_API_KEY to use the lead finder." } };
  if (!name) return { status: 400, data: { error: "Provide a business name to look up." } };

  const textQuery = [name, address].filter(Boolean).join(", ");
  let j: any;
  try {
    const r = await fetch(`${PLACES}/places:searchText`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.primaryTypeDisplayName,places.types,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.rating,places.userRatingCount,places.regularOpeningHours,places.editorialSummary,places.reviews,places.location,places.photos",
      },
      body: JSON.stringify({ textQuery, maxResultCount: 10 }),
    });
    j = await r.json();
    if (!r.ok) return { status: 502, data: { error: "Places error: " + (j?.error?.message || j?.error?.status || `HTTP ${r.status}`) } };
  } catch (e) {
    return { status: 500, data: { error: e instanceof Error ? e.message : "Lookup request failed" } };
  }

  const all = j.places || [];
  const p = all[0];
  if (!p) return { status: 404, data: { error: "No matching business found on Google. Check the name & address." } };

  const norm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const brand = norm(p.displayName?.text || name);
  const matches = all.filter((x: any) => {
    const xn = norm(x.displayName?.text);
    return xn.length >= 3 && (xn.includes(brand) || brand.includes(xn));
  });
  const locations = (matches.length > 1 ? matches : []).map((x: any) => ({
    name: x.displayName?.text || "",
    address: x.formattedAddress || "",
    phone: x.nationalPhoneNumber || x.internationalPhoneNumber || "",
    hours: x.regularOpeningHours?.weekdayDescriptions || [],
    mapsUrl: x.googleMapsUri || "",
    rating: x.rating || null,
    reviewsCount: x.userRatingCount || 0,
  }));

  const [googlePhotos, site] = await Promise.all([
    placePhotoUrls(key, p.photos, 6).catch(() => []),
    p.websiteUri ? scrapeSite(p.websiteUri).catch(() => null) : Promise.resolve(null),
  ]);
  const photos: string[] = [];
  for (const u of [...(googlePhotos || []), ...((site && site.images) || [])]) if (u && !photos.includes(u)) photos.push(u);

  const business = {
    name: p.displayName?.text || name,
    type: p.primaryTypeDisplayName?.text || humanizeType(p.types) || "local business",
    address: p.formattedAddress || address,
    city: cityFrom(p.addressComponents, p.formattedAddress),
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "",
    website: p.websiteUri || "",
    mapsUrl: p.googleMapsUri || "",
    status: p.businessStatus || "",
    rating: p.rating || null,
    reviewsCount: p.userRatingCount || 0,
    summary: p.editorialSummary?.text || "",
    hours: p.regularOpeningHours?.weekdayDescriptions || [],
    reviews: (p.reviews || []).slice(0, 4).map((rv: any) => ({
      text: rv.text?.text || rv.originalText?.text || "",
      author: rv.authorAttribution?.displayName || "",
      rating: rv.rating || null,
    })).filter((rv: any) => rv.text),
    email: site?.email || "",
    about: site?.about || "",
    social: site?.social || {},
    photos: photos.slice(0, 8),
    videos: site?.videos || [],
    audios: site?.audios || [],
    locations,
  };

  return { status: 200, data: { business } };
}
