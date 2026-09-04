import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-change-me-to-32-plus-characters-1234567890"
);
const COOKIE = "es_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { sub: string; email: string; role: string; name?: string | null };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE
  });
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      sub: String(payload.sub ?? (payload as SessionPayload).sub),
      email: String((payload as SessionPayload).email ?? ""),
      role: String((payload as SessionPayload).role ?? "customer"),
      name: (payload as SessionPayload).name ?? null
    };
  } catch {
    return null;
  }
}

export function destroySession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function isStaffRole(role?: string | null) {
  return !!role && role !== "customer";
}

export function canAccess(role: string | undefined, module: string): boolean {
  if (!role) return false;
  if (role === "superadmin" || role === "admin") return true;
  const map: Record<string, string[]> = {
    catalogue: ["catalogue"],
    inventory: ["inventory"],
    orders: ["orders"],
    marketing: ["marketing"],
    content: ["content"],
    support: ["support"],
    reporting: ["reporting"]
  };
  return (map[module] ?? []).includes(role);
}

// Simple in-memory login throttle (per-process; use Redis in multi-instance prod)
const attempts = new Map<string, { count: number; until: number }>();
export function loginThrottle(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && rec.until > now) return { allowed: false, retryAfterSec: Math.ceil((rec.until - now) / 1000) };
  return { allowed: true, retryAfterSec: 0 };
}
export function recordFailedLogin(key: string) {
  const rec = attempts.get(key) ?? { count: 0, until: 0 };
  rec.count += 1;
  if (rec.count >= 5) {
    rec.until = Date.now() + 15 * 60 * 1000;
    rec.count = 0;
  }
  attempts.set(key, rec);
}
export function clearLoginThrottle(key: string) {
  attempts.delete(key);
}
