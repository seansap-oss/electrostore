import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { fmtAUD } from "@/lib/pricing";

export const metadata = { title: "Orders" };

export default async function OrdersAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/orders");
  let rows: { id: string; orderNumber: string; email: string; status: string; total: number; createdAt: Date }[] = [];
  try { rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); } catch {}
  return (
    <AdminShell title="Orders" crumbs="Admin › Orders">
      <div className="card overflow-x-auto"><table className="table-es min-w-[760px]">
        <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody>{rows.map((o) => (<tr key={o.id}><td className="font-bold">{o.orderNumber}</td><td className="text-xs">{o.email}</td><td className="text-xs">{new Date(o.createdAt).toLocaleString("en-AU")}</td><td><span className="chip">{o.status}</span></td><td className="font-bold">{fmtAUD(o.total)}</td><td><Link href={`/admin/orders/${o.id}`} className="underline">View</Link></td></tr>))}</tbody>
      </table></div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No orders yet. Place a test checkout to see fulfilment here.</p>}
    </AdminShell>
  );
}
