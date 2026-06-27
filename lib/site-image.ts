// AI image generation (Phase 2b). Provider-agnostic: FAL (FLUX) → custom →
// Higgsfield (async) → OpenAI Images. Keys from env first, then factory secrets.
// Ported from the factory's api/image.js.
import { loadFactorySecrets } from "@/lib/site-store";

type GetKey = (name: string) => string;

function pickUrl(data: any): string {
  if (!data) return "";
  if (Array.isArray(data.data) && data.data[0]) {
    if (data.data[0].url) return data.data[0].url;
    if (data.data[0].b64_json) return "data:image/png;base64," + data.data[0].b64_json;
  }
  if (data.url) return data.url;
  if (data.image_url) return data.image_url;
  if (Array.isArray(data.output) && data.output[0]) return typeof data.output[0] === "string" ? data.output[0] : data.output[0].url || "";
  if (Array.isArray(data.images) && data.images[0]) return typeof data.images[0] === "string" ? data.images[0] : data.images[0].url || "";
  return "";
}

function higgsfieldCred(getKey: GetKey): string {
  const id = getKey("HIGGSFIELD_KEY_ID"), secret = getKey("HIGGSFIELD_KEY_SECRET");
  if (id && secret) return `${id}:${secret}`;
  return getKey("HIGGSFIELD_API_KEY") || "";
}

function higgsUrl(j: any): string {
  if (!j) return "";
  if (Array.isArray(j.images) && j.images[0]) return typeof j.images[0] === "string" ? j.images[0] : j.images[0].url || "";
  if (j.video?.url) return j.video.url;
  if (j.result?.raw?.url) return j.result.raw.url;
  return j.output_url || j.url || "";
}

async function pollHiggsfield(statusUrl: string, key: string): Promise<string> {
  const deadline = Date.now() + Number(process.env.HIGGSFIELD_POLL_MS || 48000);
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2500));
    let j: any;
    try {
      const r = await fetch(statusUrl, { headers: { Authorization: "Key " + key } });
      j = await r.json();
      if (!r.ok) continue;
    } catch {
      continue;
    }
    const status = (j.status || j.state || "").toLowerCase();
    if (status === "completed" || status === "succeeded" || status === "done") return higgsUrl(j) || "";
    if (status === "nsfw") return "__NSFW__";
    if (status === "failed" || status === "error" || status === "canceled") return "";
  }
  return "";
}

export async function imageConfigured(): Promise<boolean> {
  const s = await loadFactorySecrets();
  const has = (n: string) => Boolean(process.env[n] || s[n]);
  return has("FAL_API_KEY") || (has("IMAGE_API_URL") && has("IMAGE_API_KEY")) || has("HIGGSFIELD_API_KEY") || (has("HIGGSFIELD_KEY_ID") && has("HIGGSFIELD_KEY_SECRET")) || has("OPENAI_API_KEY");
}

export type ImageOutcome = { ok: true; url: string; provider: string } | { ok: false; status: number; error: string };

export async function generateImage(prompt: string, size = "1024x1024"): Promise<ImageOutcome> {
  const secrets = await loadFactorySecrets();
  const getKey: GetKey = (name) => process.env[name] || secrets[name] || "";

  const force = (getKey("IMAGE_PROVIDER") || "").toLowerCase();
  let url = "", key = "", model = "", provider = "";
  if (force === "fal" && getKey("FAL_API_KEY")) {
    url = process.env.FAL_IMAGE_URL || "https://fal.run/fal-ai/flux-pro/v1.1"; key = getKey("FAL_API_KEY"); provider = "fal";
  } else if (force === "custom" && getKey("IMAGE_API_URL") && getKey("IMAGE_API_KEY")) {
    url = getKey("IMAGE_API_URL"); key = getKey("IMAGE_API_KEY"); model = process.env.IMAGE_MODEL || "gpt-image-1"; provider = "custom";
  } else if (force === "openai" && getKey("OPENAI_API_KEY")) {
    url = "https://api.openai.com/v1/images/generations"; key = getKey("OPENAI_API_KEY"); model = process.env.IMAGE_MODEL || "gpt-image-1"; provider = "openai";
  } else if (force === "higgsfield" && higgsfieldCred(getKey)) {
    url = process.env.HIGGSFIELD_API_URL || "https://platform.higgsfield.ai/flux-pro/kontext/max/text-to-image"; key = higgsfieldCred(getKey); provider = "higgsfield";
  } else if (getKey("FAL_API_KEY")) {
    url = process.env.FAL_IMAGE_URL || "https://fal.run/fal-ai/flux-pro/v1.1"; key = getKey("FAL_API_KEY"); provider = "fal";
  } else if (getKey("IMAGE_API_URL") && getKey("IMAGE_API_KEY")) {
    url = getKey("IMAGE_API_URL"); key = getKey("IMAGE_API_KEY"); model = process.env.IMAGE_MODEL || "gpt-image-1"; provider = "custom";
  } else if (higgsfieldCred(getKey)) {
    url = process.env.HIGGSFIELD_API_URL || "https://platform.higgsfield.ai/flux-pro/kontext/max/text-to-image"; key = higgsfieldCred(getKey); provider = "higgsfield";
  } else if (getKey("OPENAI_API_KEY")) {
    url = "https://api.openai.com/v1/images/generations"; key = getKey("OPENAI_API_KEY"); model = process.env.IMAGE_MODEL || "gpt-image-1"; provider = "openai";
  } else {
    return { ok: false, status: 500, error: "No image provider configured. Set FAL_API_KEY (recommended), IMAGE_API_URL/KEY, HIGGSFIELD_KEY_ID+SECRET, or OPENAI_API_KEY." };
  }

  const [w, h] = String(size).toLowerCase().split("x").map(Number);
  let headers: Record<string, string>, payload: Record<string, unknown>;
  if (provider === "fal") {
    const image_size = w && h ? (w > h ? "landscape_16_9" : h > w ? "portrait_16_9" : "square_hd") : "landscape_16_9";
    headers = { "content-type": "application/json", Authorization: "Key " + key };
    payload = { prompt, image_size, num_images: 1, output_format: "jpeg" };
  } else if (provider === "higgsfield") {
    const aspect = w && h ? (w > h ? "16:9" : h > w ? "9:16" : "1:1") : "16:9";
    headers = { "content-type": "application/json", Authorization: "Key " + key };
    payload = { prompt, aspect_ratio: aspect, safety_tolerance: 2 };
  } else {
    headers = { "content-type": "application/json", Authorization: "Bearer " + key };
    payload = { model, prompt, n: 1, size };
  }

  try {
    const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const raw = await r.text();
    let data: any = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
    if (!r.ok) {
      const detail = data?.error?.message || data?.error || data?.message || data?.detail || raw.slice(0, 300) || "Image API error";
      return { ok: false, status: r.status, error: String(detail) };
    }
    if (provider === "higgsfield") {
      let out = higgsUrl(data);
      if (!out) {
        const id = data.request_id || data.id;
        let statusUrl = data.status_url;
        if (!statusUrl && id) { try { statusUrl = new URL(url).origin + "/requests/" + encodeURIComponent(id) + "/status"; } catch { /* ignore */ } }
        if (!statusUrl) return { ok: false, status: 502, error: "Higgsfield returned no request id or status_url." };
        out = await pollHiggsfield(statusUrl, key);
      }
      if (out === "__NSFW__") return { ok: false, status: 422, error: "Prompt flagged unsafe; try a different description." };
      if (!out) return { ok: false, status: 504, error: "Higgsfield timed out before finishing." };
      return { ok: true, url: out, provider };
    }
    const out = pickUrl(data);
    if (!out) return { ok: false, status: 502, error: "Image API returned no image." };
    return { ok: true, url: out, provider };
  } catch (e) {
    return { ok: false, status: 500, error: e instanceof Error ? e.message : "Request failed" };
  }
}
