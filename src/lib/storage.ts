import { promises as fs } from "fs";
import path from "path";

// Storage abstraction: local disk now, S3/Supabase later without changing callers.
export async function saveUpload(file: File, folder: string) {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  void provider;
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 80) || "upload";
  const name = `${Date.now()}-${safe}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return `/uploads/${folder}/${name}`;
}

export function publicMediaUrl(p: string | null | undefined) {
  if (!p) return "/images/placeholder.svg";
  if (p.startsWith("http") || p.startsWith("/")) return p;
  return `/${p}`;
}
