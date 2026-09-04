import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { fmtAUD } from "@/lib/pricing";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/dashboard");
  let stats = { revenue: 0, orders: 0, products: 0, customers: 0, low: 0, out: 0, pending: 0 };
  let recent: { orderNumber: string; total: number; status: string; createdAt: Date }[] = [];
  try {
    const [orders, products, customers, low, out, pending] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } }, select: { total: true } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.order.count({ where: { fulfilment: "processing" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
    ]);
    const rev = orders.reduce((a, o) => a + o.total, 0);
    stats = { revenue: rev, orders: orders.length, products, customers, low, out, pending };
    recent = pending as never;
  } catch { /* empty DB during first build */ }
  const cards: [string, string, string][] = [
    ["Revenue (month)", fmtAUD(stats.revenue), "success"],
    ["Orders (month)", String(stats.orders), ""],
    ["Products", String(stats.products), ""],
    ["Customers", String(stats.customers), ""],
    ["Low stock", String(stats.low), "warn"],
    ["Out of stock", String(stats.out), "warn"],
    ["Awaiting fulfilment", String(stats.pending), "warn"]
  ];
  return (
    <AdminShell title="Dashboard" crumbs="Admin › Dashboard">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([t, v]) => (<div key={t} className="card p-4"><div className="text-xs font-bold uppercase text-charcoal-mute">{t}</div><div className="text-3xl font-extrabold">{v}</div></div>))}
      </div>
      <div className="card mt-4 p-4">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Recent orders</h2><Link href="/admin/orders" className="text-sm underline">View all</Link></div>
        {recent.length === 0 ? <p className="text-sm text-charcoal-mute">No orders yet — share your store to get the first sale.</p> :
          <table className="table-es"><thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead><tbody>
            {recent.map((o) => (<tr key={o.orderNumber}><td className="font-bold">{o.orderNumber}</td><td>{o.status}</td><td>{fmtAUD(o.total)}</td></tr>))}
          </tbody></table>}
      </div>
    </AdminShell>
  );
}
