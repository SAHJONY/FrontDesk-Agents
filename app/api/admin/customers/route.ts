import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listCustomers, updateCustomer, deleteCustomer, upsertCustomerByEmail } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customers = await listCustomers();
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    const customer = await upsertCustomerByEmail({ email, name: body.name, business: body.business });
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const customer = await updateCustomer(id, body.patch ?? {});
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteCustomer(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
