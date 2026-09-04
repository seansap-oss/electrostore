import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Returns" };

export default async function ReturnsAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/returns");
  let rows: { id: string; status: string; reason: string | null; order: { orderNumber: string } }[] = [];
  try { rows = await prisma.return.findMany({ include: { order: true }, orderBy: { createdAt: "desc" }, take: 100 }); } catch {}
  return (
    <AdminShell title="Returns" crumbs="Admin › Returns">
      <div className="card overflow-x-auto"><table className="table-es min-w-[560px]"><thead><tr><th>Order</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.id}><td className="font-bold">{r.order.orderNumber}</td><td>{r.reason}</td><td><span className="chip">{r.status}</span></td></tr>))}</tbody></table></div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No return requests. Workflow: review → approve/reject → instructions → received → refund → restock.</p>}
    </AdminShell>
  );
}
