import { NextRequest, NextResponse } from "next/server";
import { addBooking, listBookings } from "@/lib/store";
import { emailBookingConfirmation } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  const bookings = await listBookings();
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name || !b.datetime) {
      return NextResponse.json({ error: "name and datetime are required" }, { status: 400 });
    }
    const booking = await addBooking({
      name: String(b.name).slice(0, 120),
      service: String(b.service ?? "appointment").slice(0, 200),
      datetime: String(b.datetime).slice(0, 120),
      phone: String(b.phone ?? "").slice(0, 40),
    });
    emailBookingConfirmation(booking).catch(() => {});
    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
