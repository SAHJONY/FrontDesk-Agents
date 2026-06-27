import { getSite, getBizEdits, bizInject, siteStoreConfigured } from "@/lib/site-store";

export const runtime = "nodejs";

// Public hosting for generated customer websites. GET /s/:slug serves the
// published HTML, applying the owner's live edits at serve time. Payment-gated:
// a suspended/pending site shows a "paused" page until payment is current.
// Ported from the website-factory's api/site.js.

function notFound(msg?: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Not found</title><body style="font-family:system-ui;background:#0d0d12;color:#f0eef2;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div><h1 style="font-size:48px;margin:0">404</h1><p style="color:#aaa7b5">${msg || "This site isn't published."}</p><a href="/" style="color:#ff8366">← frontdeskagents.com</a></div></body>`,
    { status: 404, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!siteStoreConfigured()) return notFound("Storage not configured.");

  let rec;
  try {
    rec = await getSite(slug);
  } catch {
    return notFound("Temporarily unavailable.");
  }
  if (!rec || !rec.html) return notFound();

  // Payment-gated hosting — suspended/pending sites are offline until paid.
  if (rec.status === "suspended" || rec.status === "pending") {
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>${rec.name || "Website"}</title><body style="font-family:system-ui;background:#0d0d12;color:#f0eef2;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div style="max-width:420px;padding:24px"><div style="font-size:40px">🔒</div><h1 style="font-size:24px;margin:10px 0">This site is paused</h1><p style="color:#aaa7b5;line-height:1.6">${rec.name ? rec.name + "'s" : "This"} website is temporarily offline pending payment. It goes live automatically once payment is complete.</p><a href="/" style="color:#ff8366">frontdeskagents.com</a></div></body>`,
      { status: 402, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
    );
  }

  let html = rec.html;
  try {
    const edits = await getBizEdits(slug);
    if (edits) html = html.replace(/<\/body>/i, bizInject(edits) + "</body>");
  } catch {
    /* serve the base page if edits can't be loaded */
  }

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=30" },
  });
}
