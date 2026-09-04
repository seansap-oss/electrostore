import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, createSession, loginThrottle, recordFailedLogin, clearLoginThrottle } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  // Sign-in is read-only (credential check + cookie) so it stays available everywhere.
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    const key = `login:${email.toLowerCase()}:${req.headers.get("x-forwarded-for") ?? "local"}`;
    const gate = loginThrottle(key);
    if (!gate.allowed) return NextResponse.json({ error: `Too many attempts. Try again in ${gate.retryAfterSec}s.` }, { status: 429 });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.status !== "active" || !(await verifyPassword(password, user.passwordHash))) {
      recordFailedLogin(key);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    clearLoginThrottle(key);
    await createSession({ sub: user.id, email: user.email, role: user.role, name: user.name });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Login failed." }, { status: 400 });
  }
}
