import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { findLeads, lookupBusiness } from "@/lib/leads-find";
import { scoreLead } from "@/lib/lead-scoring";
import { addLead } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

// Autonomous lead engine — owner-only. Google Places discovery + enrichment.
//   POST { lookup, name, address }                 -> { business }
//   POST { keyword, locationText | lat,lng, save } -> { leads (scored) }
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  // LOOKUP mode (research one business → builder pre-fill).
  if (body.lookup || (body.name && body.address && !body.keyword && body.lat == null && body.lng == null)) {
    const res = await lookupBusiness(String(body.name || "").slice(0, 120).trim(), String(body.address || "").slice(0, 200).trim());
    return NextResponse.json(res.data, { status: res.status });
  }

  // NEARBY mode (discover prospects).
  const res = await findLeads({ lat: body.lat, lng: body.lng, keyword: body.keyword, radius: body.radius, locationText: body.locationText });
  if (res.status !== 200 || !Array.isArray(res.data.leads)) {
    return NextResponse.json(res.data, { status: res.status });
  }

  const keyword = String(res.data.keyword || body.keyword || "");
  // Score each discovered prospect with the lead-scoring engine.
  const scored = (res.data.leads as any[]).map((l) => {
    const sc = scoreLead({ industry: keyword, business: l.name, signals: { hasWebsite: !l.needsSite } });
    return { ...l, score: sc.score, tier: sc.tier, recommendedOffer: sc.recommendedOffer };
  });

  // Optional: persist high-value prospects to the CRM.
  let saved = 0;
  if (body.save) {
    for (const l of scored) {
      if (!l.email && !l.phone) continue;
      try {
        await addLead({
          email: l.email || undefined,
          phone: l.phone || undefined,
          business: l.name,
          industry: keyword || undefined,
          plan: undefined,
          source: "places-prospecting",
        });
        saved++;
      } catch {
        /* best-effort */
      }
    }
  }

  return NextResponse.json({ leads: scored, saved });
}
