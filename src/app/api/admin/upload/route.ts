import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml", "image/gif", "video/mp4", "video/webm"]);

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (process.env.DEMO_MODE === "true")
    return NextResponse.json({ error: "Uploads are disabled on the live preview site — files cannot be saved without a production database." }, { status: 503 });
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: `Type ${file.type} not allowed.` }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Max 25MB." }, { status: 400 });
  const url = await saveUpload(file, "library");
  await prisma.media.create({ data: { url, name: file.name, mime: file.type, size: file.size } }).catch(() => {});
  if ((fd.get("redirect") ?? "1") === "1" && req.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(new URL("/admin/media", req.url), 303);
  }
  return NextResponse.json({ ok: true, url });
}
