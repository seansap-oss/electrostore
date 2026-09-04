import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  if (process.env.DEMO_MODE === "true")
    return NextResponse.json({ error: "Account creation is temporarily unavailable. Please check back soon." }, { status: 503 });
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(), firstName: data.firstName, lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`, mobile: data.mobile,
        passwordHash: await hashPassword(data.password), role: "customer"
      }
    });
    await prisma.userProfile.create({ data: { userId: user.id } }).catch(() => {});
    await createSession({ sub: user.id, email: user.email, role: user.role, name: user.name });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Sign up failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
