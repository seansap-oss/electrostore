import prisma from "@/lib/db";

export async function audit(opts: {
  actorId?: string | null; action: string; module: string; recordId?: string;
  before?: unknown; after?: unknown; ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId ?? null,
        action: opts.action,
        module: opts.module,
        recordId: opts.recordId,
        before: opts.before ? JSON.stringify(opts.before).slice(0, 4000) : null,
        after: opts.after ? JSON.stringify(opts.after).slice(0, 4000) : null,
        ip: opts.ip
      }
    });
  } catch { /* never break admin flow on audit failure */ }
}
