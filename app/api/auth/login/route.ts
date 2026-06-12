import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, sessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!verifyCredentials(String(email ?? ""), String(password ?? ""))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = sessionToken();
    if (!token) {
      // verifyCredentials returned true only if both env vars are set, so this
      // branch is unreachable in practice — defensive null-guard for the type checker.
      return NextResponse.json({ error: "Owner credentials not configured" }, { status: 503 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("fd_owner", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fd_owner", "", { maxAge: 0, path: "/" });
  return res;
}
