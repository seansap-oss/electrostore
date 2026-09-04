import fs from "fs";
import os from "os";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Resolve the SQLite file to an absolute path, and on serverless hosts
// (read-only bundle) stage a working copy in /tmp. Writes there are
// per-instance/ephemeral — production writes stay behind DEMO guards.
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!raw.startsWith("file:")) return raw;
  const rel = raw.slice("file:".length).replace(/^\.\//, "");
  const candidates = [
    path.join(process.cwd(), rel),
    path.join(process.cwd(), "prisma", path.basename(rel))
  ];
  let found: string | null = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) { found = c; break; }
    } catch { /* try next */ }
  }
  if (!found) return raw; // let Prisma surface the real error
  if (process.env.VERCEL) {
    const dest = path.join(os.tmpdir(), "electrostore-demo.db");
    try {
      if (!fs.existsSync(dest)) fs.copyFileSync(found, dest);
      const sep = dest.includes("?") ? "&" : "?";
      process.env.DATABASE_URL = `file:${dest}${sep}connection_limit=1`;
      return process.env.DATABASE_URL;
    } catch { /* fall through to direct path */ }
  }
  process.env.DATABASE_URL = `file:${found}`;
  return process.env.DATABASE_URL;
}

resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
