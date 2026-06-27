// Website Factory storage (Phase 1 of the merge). Generated customer sites are
// stored as HTML in Upstash Redis under `fda:site:<slug>`, with owner-editable
// overlays under `fda:biz:<slug>:<section>`. Ported from the standalone
// website-agency's api/site.js + api/data.js KV layer.
//
// Upstash creds (UPSTASH_REDIS_REST_URL / _TOKEN) must be set in the platform
// env — see the unified .env.example. If unset, every read returns null and the
// caller serves a graceful 404/unconfigured page.

export type SiteStatus = "published" | "suspended" | "pending" | string;

export type SiteRecord = {
  html: string;
  name?: string;
  status?: SiteStatus;
  [k: string]: unknown;
};

export type BizEdits = {
  content?: unknown;
  media?: unknown;
  promotions?: unknown;
  payments?: unknown;
} | null;

export function siteStoreConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function upstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { base: url.replace(/\/$/, ""), auth: { Authorization: `Bearer ${token}` } };
}

async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const u = upstash();
  if (!u) return null;
  try {
    const r = await fetch(`${u.base}/get/${encodeURIComponent(key)}`, {
      headers: u.auth,
      cache: "no-store",
    });
    const j = (await r.json()) as { result?: string };
    if (j && j.result) {
      try {
        return JSON.parse(j.result) as T;
      } catch {
        return j.result as unknown as T;
      }
    }
  } catch {
    /* DB offline → null */
  }
  return null;
}

async function kvSetRaw(key: string, value: string): Promise<void> {
  const u = upstash();
  if (!u) throw new Error("Storage not configured");
  const r = await fetch(`${u.base}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { ...u.auth, "content-type": "text/plain" },
    body: value,
  });
  if (!r.ok) throw new Error("Upstash write failed");
}

async function kvDel(key: string): Promise<void> {
  const u = upstash();
  if (!u) return;
  await fetch(`${u.base}/del/${encodeURIComponent(key)}`, { method: "POST", headers: u.auth });
}

// AI provider keys the factory stores in Upstash under fda:secrets (managed via
// its dashboard). Env always wins; this is the fallback source.
export async function loadFactorySecrets(): Promise<Record<string, string>> {
  return (await kvGet<Record<string, string>>("fda:secrets")) ?? {};
}

export function cleanSlug(s: string): string {
  return String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
}

function slugify(s: string): string {
  return String(s || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "site";
}
function rand4() { return Math.random().toString(36).slice(2, 6); }

export type SiteIndexEntry = { name: string; slug: string; at: string; status?: string; views?: number };
const INDEX_KEY = "fda:sites:index";

export async function listSitesIndex(): Promise<SiteIndexEntry[]> {
  const idx = await kvGet<SiteIndexEntry[]>(INDEX_KEY);
  return Array.isArray(idx) ? idx : [];
}

// Save (or update) a generated site. Provisions a Business Console access code
// the first time, and binds the __SITE_SLUG__ placeholder. Ported from sites.js.
export async function saveSite(input: { name: string; html: string; slug?: string; status?: SiteStatus; bizType?: string; bizCity?: string }): Promise<{ slug: string; url: string; bizCode: string }> {
  const name = String(input.name || "Website").slice(0, 120);
  const slug = input.slug ? slugify(input.slug) : `${slugify(name)}-${rand4()}`;
  const html = String(input.html).split("__SITE_SLUG__").join(slug);

  let bizCode = "";
  try {
    const existingAuth = await kvGet<{ code?: string }>(`fda:biz:${slug}:auth`);
    if (existingAuth?.code) bizCode = existingAuth.code;
    else {
      bizCode = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[O0I1]/g, "X");
      await kvSetRaw(`fda:biz:${slug}:auth`, JSON.stringify({ code: bizCode, at: new Date().toISOString() }));
    }
    const prof = (await kvGet<Record<string, unknown>>(`fda:biz:${slug}:profile`)) ?? {};
    prof.name = name; prof.slug = slug;
    if (input.bizType) prof.type = String(input.bizType).slice(0, 80);
    if (input.bizCity) prof.city = String(input.bizCity).slice(0, 80);
    await kvSetRaw(`fda:biz:${slug}:profile`, JSON.stringify(prof));
  } catch {
    /* provisioning best-effort */
  }

  const now = new Date().toISOString();
  let status: SiteStatus = input.status === "pending" || input.status === "suspended" || input.status === "active" ? input.status : "";
  if (!status) {
    const prev = await getSite(slug);
    status = (prev?.status as SiteStatus) || "active";
  }
  await kvSetRaw(`fda:site:${slug}`, JSON.stringify({ name, slug, html, at: now, status }));

  const index = await listSitesIndex();
  const existing = index.find((s) => s.slug === slug);
  if (existing) { existing.name = name; existing.at = now; existing.status = status; }
  else index.unshift({ name, slug, at: now, status });
  await kvSetRaw(INDEX_KEY, JSON.stringify(index));

  return { slug, url: `/s/${slug}`, bizCode };
}

export async function deleteSite(slug: string): Promise<string> {
  const clean = slugify(slug);
  await kvDel(`fda:site:${clean}`);
  const index = (await listSitesIndex()).filter((s) => s.slug !== clean);
  await kvSetRaw(INDEX_KEY, JSON.stringify(index));
  return clean;
}

export async function setSiteStatus(slug: string, status: "active" | "suspended"): Promise<void> {
  const clean = slugify(slug);
  const rec = await getSite(clean);
  if (!rec) throw new Error("Site not found");
  rec.status = status;
  await kvSetRaw(`fda:site:${clean}`, JSON.stringify(rec));
  const index = await listSitesIndex();
  const e = index.find((s) => s.slug === clean);
  if (e) { e.status = status; await kvSetRaw(INDEX_KEY, JSON.stringify(index)); }
}

export async function getSite(slug: string): Promise<SiteRecord | null> {
  const clean = cleanSlug(slug);
  if (!clean) return null;
  return kvGet<SiteRecord>(`fda:site:${clean}`);
}

// Owner's live-edit overlay (content/media/promotions/payments) for a slug.
export async function getBizEdits(slug: string): Promise<BizEdits> {
  const clean = cleanSlug(slug);
  if (!clean) return null;
  const [content, media, promotions, payments] = await Promise.all([
    kvGet(`fda:biz:${clean}:content`),
    kvGet(`fda:biz:${clean}:media`),
    kvGet(`fda:biz:${clean}:promotions`),
    kvGet(`fda:biz:${clean}:payments`),
  ]);
  if (!content && !media && !promotions && !payments) return null;
  return { content, media, promotions, payments };
}

// Self-contained client patcher that applies the owner's edits at load time.
// Ported verbatim from the factory's bizInject so existing published sites and
// business-console edits keep working identically.
export function bizInject(edits: NonNullable<BizEdits>): string {
  const data = JSON.stringify(edits).replace(/</g, "\\u003c");
  const patcher = `(function(){try{
var E=window.__BIZ_EDITS__||{};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});};
var t=(E.content&&E.content.text)||{};
Object.keys(t).forEach(function(k){if(t[k]==null||t[k]==="")return;document.querySelectorAll('[data-edit="'+k+'"]').forEach(function(el){el.textContent=t[k];});});
var promos=((E.promotions&&E.promotions.items)||E.promotions||[]).filter(function(p){return p&&p.active!==false&&(p.title||p.body);});
var pm=document.querySelector("[data-biz-promos]");
if(pm&&promos.length){pm.innerHTML=promos.map(function(p){return '<div style="background:linear-gradient(135deg,#ff8366,#ffb199);color:#1a0d08;padding:12px 20px;text-align:center;font-weight:600">'+(p.title?'<strong>'+esc(p.title)+'</strong> ':'')+esc(p.body||'')+(p.code?' — code <strong>'+esc(p.code)+'</strong>':'')+'</div>';}).join("");}
var photos=(E.media&&E.media.photos)||[];var gal=document.querySelector("[data-biz-gallery]");
if(gal&&photos.length)photos.forEach(function(u){var d=document.createElement("div");d.className="gphoto reveal";d.innerHTML='<img class="cimg" loading="lazy" src="'+esc(u)+'" alt="">';gal.appendChild(d);});
var mediaMount=document.querySelector("[data-biz-media]");
if(mediaMount){var vids=(E.media&&E.media.videos)||[],auds=(E.media&&E.media.audio)||[],h="";
vids.forEach(function(v){var y=String(v).match(/(?:youtu\\.be\\/|v=)([\\w-]{11})/);h+=y?'<div style="position:relative;padding-top:56%;margin:14px 0"><iframe src="https://www.youtube.com/embed/'+y[1]+'" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:14px" allowfullscreen></iframe></div>':'<video src="'+esc(v)+'" controls style="width:100%;border-radius:14px;margin:14px 0"></video>';});
auds.forEach(function(a){h+='<audio src="'+esc(a)+'" controls style="width:100%;margin:10px 0"></audio>';});
if(h){mediaMount.innerHTML='<div style="max-width:980px;margin:0 auto;padding:8vh 28px">'+h+'</div>';}}
var pays=(E.payments&&E.payments.customer)||[];var payMount=document.querySelector("[data-biz-pay]");
if(payMount&&pays.length){payMount.innerHTML='<div style="border-top:1px solid rgba(255,255,255,.1);max-width:1180px;margin:0 auto;padding:9vh 28px;text-align:center"><div style="font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#ff8366;margin-bottom:14px">Payments</div><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">'+pays.map(function(m){var label=esc(m.label||m.type||"Pay");return m.url?'<a href="'+esc(m.url)+'" target="_blank" rel="noopener" style="background:#ff8366;color:#1a0d08;font-weight:700;padding:11px 20px;border-radius:999px;text-decoration:none">'+label+'</a>':'<span style="border:1px solid #ff8366;color:#ff8366;padding:11px 20px;border-radius:999px">'+label+(m.handle?': '+esc(m.handle):'')+'</span>';}).join("")+'</div></div>';}
}catch(e){}})();`;
  return `<script>window.__BIZ_EDITS__=${data};${patcher}</script>`;
}
