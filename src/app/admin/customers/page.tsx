import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Customers" };

export default async function CustomersAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/customers");
  let rows: { id: string; email: string; name: string | null; role: string; createdAt: Date; _count?: { orders: number } }[] = [];
  try { rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { orders: true } } } }); } catch {}
  return (
    <AdminShell title="Customers" crumbs="Admin › Customers">
      <div className="card overflow-x-auto"><table className="table-es min-w-[640px]">
        <thead><tr><th>Customer</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th></tr></thead>
        <tbody>{rows.map((u) => (<tr key={u.id}><td className="font-bold">{u.name ?? "—"}</td><td>{u.email}</td><td><span className="chip">{u.role}</span></td><td>{u._count?.orders ?? 0}</td><td className="text-xs">{new Date(u.createdAt).toLocaleDateString("en-AU")}</td></tr>))}</tbody>
      </table></div>
      <p className="mt-2 text-xs text-charcoal-mute">Passwords are never displayed. Customer detail (addresses, orders, returns, notes) opens from the order record.</p>
    </AdminShell>
  );
}
