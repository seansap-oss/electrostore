import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { fmtAUD } from "@/lib/pricing";

export const metadata = { title: "Reports" };

export default async function ReportsAdmin({ searchParams }: { searchParams: { range?: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/reports");
  const range = searchParams.range ?? "30d";
  const since = new Date(Date.now() - (range === "7d" ? 7 : range === "today" ? 1 : 30) * 864e5);
  let orders: { total: number; createdAt: Date }[] = [];
  try { orders = await prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { total: true, createdAt: true } }); } catch {}
  const revenue = orders.reduce((a, o) => a + o.total, 0);
  return (
    <AdminShell title="Reports" crumbs="Admin › Reports">
      <div className="mb-3 flex gap-2 text-sm font-semibold">
        {[["today", "Today"], ["7d", "7 days"], ["30d", "30 days"]].map(([v, l]) => (<a key={v} href={`/admin/reports?range=${v}`} className={`chip ${range === v ? "!bg-volt" : ""}`}>{l}</a>))}
        <a href="/admin/reports" className="chip">Export CSV</a>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4"><div className="text-xs font-bold uppercase text-charcoal-mute">Revenue</div><div className="text-3xl font-extrabold">{fmtAUD(revenue)}</div></div>
        <div className="card p-4"><div className="text-xs font-bold uppercase text-charcoal-mute">Orders</div><div className="text-3xl font-extrabold">{orders.length}</div></div>
        <div className="card p-4"><div className="text-xs font-bold uppercase text-charcoal-mute">Avg order</div><div className="text-3xl font-extrabold">{orders.length ? fmtAUD(Math.round(revenue / orders.length)) : "$0.00"}</div></div>
      </div>
      <div className="card mt-3 p-4 text-sm text-charcoal-mute">Sales by product / category / brand, stock, refunds, coupon use — filter Today · Yesterday · 7d · 30d · Month · Custom, CSV export.</div>
    </AdminShell>
  );
}
