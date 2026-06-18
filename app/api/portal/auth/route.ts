import { NextRequest, NextResponse } from "next/server";
import { registerCustomer, loginCustomer, sessionTokenFor, CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { emailLeadAlert } from "@/lib/email";

export const runtime = "nodejs";

function withSession(customerId: string, body: Record<string, unknown>) {
  const res = NextResponse.json(body);
  res.cookies.set(CUSTOMER_COOKIE, sessionTokenFor(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode === "register" ? "register" : "login";
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (mode === "register") {
      const result = await registerCustomer({
        email,
        password,
        name: body.name ? String(body.name).slice(0, 120) : undefined,
        business: body.business ? String(body.business).slice(0, 200) : undefined,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
      emailLeadAlert({ email, business: result.customer.business, source: "portal-signup" }).catch(() => {});
      return withSession(result.customer.id, { ok: true, customer: result.customer });
    }

    const customer = await loginCustomer(email, password);
    if (!customer) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    return withSession(customer.id, { ok: true, customer });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
