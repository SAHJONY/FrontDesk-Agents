// OpenMontage — full agentic video production (Python/FFmpeg/Remotion). It can't
// run in a serverless function, so it lives behind an external render worker
// (OPENMONTAGE_URL) that speaks a small async job contract:
//   POST {OPENMONTAGE_URL}/jobs   { brief } -> { jobId }
//   GET  {OPENMONTAGE_URL}/jobs/<id>        -> { state, url?, progress?, error? }
// The builder submits a production brief, gets a jobId, and polls until the
// finished video URL is ready. Higgsfield (lib/site-image) is the quick-clip
// fallback when no worker is configured.
import { loadFactorySecrets } from "@/lib/site-store";

type GetKey = (name: string) => string;

async function getKey(): Promise<GetKey> {
  const secrets = await loadFactorySecrets();
  return (name: string) => process.env[name] || secrets[name] || "";
}

export async function openMontageConfigured(): Promise<boolean> {
  return Boolean((await getKey())("OPENMONTAGE_URL"));
}

function headers(token: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (token) h.authorization = "Bearer " + token;
  return h;
}

export type VideoBrief = {
  prompt: string;
  business?: string;
  type?: string;
  city?: string;
  durationSec?: number;
  aspect?: string;
  heroImage?: string;
  photos?: string[];
};

export type SubmitOutcome = { ok: true; jobId: string } | { ok: false; status: number; error: string };
export type JobStatus = { ok: true; state: string; url: string; progress: unknown; error: string | null } | { ok: false; status: number; error: string };

// Submit a production brief to the OpenMontage worker. Returns a jobId to poll.
export async function submitOpenMontageJob(brief: VideoBrief): Promise<SubmitOutcome> {
  const k = await getKey();
  const base = k("OPENMONTAGE_URL");
  if (!base) return { ok: false, status: 500, error: "OpenMontage worker not configured (OPENMONTAGE_URL)." };
  const payload = {
    brief: {
      prompt: brief.prompt,
      business: brief.business || "",
      type: brief.type || "",
      city: brief.city || "",
      durationSec: Math.max(5, Math.min(90, Number(brief.durationSec) || 20)),
      aspect: brief.aspect || "16:9",
      heroImage: brief.heroImage || "",
      photos: (brief.photos || []).slice(0, 12),
      style: "cinematic 8K Tesla/Apple flagship brand film",
    },
  };
  try {
    const r = await fetch(base.replace(/\/$/, "") + "/jobs", { method: "POST", headers: headers(k("OPENMONTAGE_TOKEN")), body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({} as any));
    if (!r.ok) return { ok: false, status: r.status, error: j?.error || `worker HTTP ${r.status}` };
    const jobId = j.jobId || j.id || j?.job?.id;
    if (!jobId) return { ok: false, status: 502, error: "Worker returned no jobId." };
    return { ok: true, jobId: String(jobId) };
  } catch (e) {
    return { ok: false, status: 502, error: e instanceof Error ? e.message : "worker unreachable" };
  }
}

// Poll a job's status. The builder calls this on an interval until state=done.
export async function pollOpenMontageJob(id: string): Promise<JobStatus> {
  const k = await getKey();
  const base = k("OPENMONTAGE_URL");
  if (!base) return { ok: false, status: 500, error: "OpenMontage worker not configured (OPENMONTAGE_URL)." };
  try {
    const r = await fetch(base.replace(/\/$/, "") + "/jobs/" + encodeURIComponent(id), { headers: headers(k("OPENMONTAGE_TOKEN")) });
    const j = await r.json().catch(() => ({} as any));
    if (!r.ok) return { ok: false, status: 502, error: j?.error || `worker HTTP ${r.status}` };
    return { ok: true, state: j.state || j.status || "running", url: j.url || j?.video?.url || "", progress: j.progress ?? null, error: j.error ?? null };
  } catch (e) {
    return { ok: false, status: 502, error: e instanceof Error ? e.message : "worker unreachable" };
  }
}
