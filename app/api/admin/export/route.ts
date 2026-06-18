import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listBookings, listLeads, listCustomers, listSubscriptions } from "@/lib/store";
import { listAllSecrets, loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

// Full operator data export — JSON of everything except raw secret values.
// Secret names + categories are included so the owner can rebuild state on a
// new deploy, but secret values stay masked (paste them back in via the env UI).
export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [bookings, leads, customers, subscriptions, secrets] = await Promise.all([
    listBookings(),
    listLeads(),
    listCustomers(),
    listSubscriptions(),
    listAllSecrets(),
  ]);

  const exported = {
    exportedAt: new Date().toISOString(),
    counts: {
      bookings: bookings.length,
      leads: leads.length,
      customers: customers.length,
      subscriptions: subscriptions.length,
    },
    bookings,
    leads,
    customers,
    subscriptions,
    // Names + categories + status only. Values are NEVER exported.
    secrets: secrets.map((s) => ({
      name: s.name,
      category: s.category,
      hasValue: s.hasValue,
      source: s.source,
      updatedAt: s.updatedAt,
    })),
  };

  return new NextResponse(JSON.stringify(exported, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="frontdesk-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
