import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { resetCustomerUsage, getUsage } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });
  const count = await getUsage(customerId);
  return NextResponse.json({ customerId, count });
}

export async function DELETE(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });
  await resetCustomerUsage(customerId);
  return NextResponse.json({ ok: true });
}
