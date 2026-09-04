import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const email = String(fd?.get("email") ?? "");
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  return NextResponse.redirect(new URL("/?subscribed=1", req.url), 303);
}
export async function GET() {
  return NextResponse.json({ ok: true });
}
