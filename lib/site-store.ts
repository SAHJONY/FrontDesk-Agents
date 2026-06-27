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

export function cleanSlug(s: string): string {
  return String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
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
