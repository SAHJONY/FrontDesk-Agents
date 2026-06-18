import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import {
  listAllSecrets,
  setSecret,
  deleteSecret,
  loadSecretOverrides,
  isForbidden,
} from "@/lib/secrets";

export const runtime = "nodejs";

export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const secrets = await listAllSecrets();
  return NextResponse.json({ secrets });
}

export async function PUT(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { name?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const value = body.value;
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (typeof value !== "string") return NextResponse.json({ error: "value must be a string" }, { status: 400 });
  if (isForbidden(name)) {
    return NextResponse.json({ error: `${name} cannot be set at runtime — set it in Vercel env.` }, { status: 400 });
  }
  try {
    await setSecret(name, value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save secret" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (isForbidden(name)) {
    return NextResponse.json({ error: `${name} cannot be deleted at runtime.` }, { status: 400 });
  }
  try {
    await deleteSecret(name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete secret" }, { status: 400 });
  }
}
