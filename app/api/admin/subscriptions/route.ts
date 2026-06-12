import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import {
  listSubscriptions,
  upsertSubscription,
  updateSubscription,
  deleteSubscription,
  upsertCustomerByEmail,
  type SubProvider,
  type SubStatus,
} from "@/lib/store";
import { getPlan } from "@/lib/plans";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

const PROVIDERS: SubProvider[] = ["stripe", "square", "paypal"];
const STATUSES: SubStatus[] = ["active", "trialing", "past_due", "canceled", "incomplete"];

export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subscriptions = await listSubscriptions();
  return NextResponse.json({ subscriptions });
}

// Owner-grant — manually create or update a subscription without involving the
// payment provider. Use for comp accounts, internal testing, or correcting a
// missed webhook.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const planId = String(body.planId ?? "");
    const provider = (body.provider as SubProvider) || "stripe";
    const status = (body.status as SubStatus) || "active";

    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    if (!getPlan(planId)) return NextResponse.json({ error: "Unknown planId" }, { status: 400 });
    if (!PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: `provider must be one of ${PROVIDERS.join(", ")}` }, { status: 400 });
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
    }

    const customer = await upsertCustomerByEmail({ email, name: body.name });
    const subscription = await upsertSubscription({
      customerId: customer.id,
      planId,
      provider,
      providerSubId: body.providerSubId || `owner-grant:${crypto.randomUUID()}`,
      status,
      currentPeriodEnd: body.currentPeriodEnd,
    });
    return NextResponse.json({ subscription, customer });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid body" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const subscription = await updateSubscription(id, body.patch ?? {});
    if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteSubscription(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
