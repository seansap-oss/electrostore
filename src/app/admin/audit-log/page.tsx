import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Audit Log" };

export default async function AuditAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/audit-log");
  let rows: { action: string; module: string; recordId: string | null; createdAt: Date; actor?: { email: string } | null }[] = [];
  try { rows = await prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 100 }); } catch {}
  return (
    <AdminShell title="Audit Log" crumbs="Admin › Audit Log">
      <div className="card overflow-x-auto"><table className="table-es min-w-[640px]"><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Module</th><th>Record</th></tr></thead>
        <tbody>{rows.map((r, k) => (<tr key={k}><td className="text-xs">{new Date(r.createdAt).toLocaleString("en-AU")}</td><td>{r.actor?.email ?? "—"}</td><td className="font-mono text-xs">{r.action}</td><td>{r.module}</td><td className="font-mono text-xs">{r.recordId ?? "—"}</td></tr>))}</tbody></table></div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">Price changes, inventory edits, refunds, coupons and publishes are recorded here with before/after data.</p>}
    </AdminShell>
  );
}
