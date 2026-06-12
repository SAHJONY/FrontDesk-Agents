import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listBookings, addBooking, updateBooking, deleteBooking } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await listBookings();
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const booking = await addBooking({
      name: String(body.name ?? ""),
      service: String(body.service ?? ""),
      datetime: String(body.datetime ?? ""),
      phone: String(body.phone ?? ""),
    });
    return NextResponse.json({ booking });
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
    const booking = await updateBooking(id, body.patch ?? {});
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteBooking(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
