import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { saveCoupon } from "../actions";

export const metadata = { title: "Coupons" };

export default async function CouponsAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/coupons");
  let rows: { code: string; type: string; amount: number; minSpend: number; usedCount: number; enabled: boolean }[] = [];
  try { rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }); } catch {}
  return (
    <AdminShell title="Coupons" crumbs="Admin › Coupons">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card overflow-x-auto"><table className="table-es min-w-[560px]"><thead><tr><th>Code</th><th>Type</th><th>Amount</th><th>Min spend</th><th>Used</th><th>Status</th></tr></thead>
          <tbody>{rows.map((c) => (<tr key={c.code}><td className="font-mono font-bold">{c.code}</td><td>{c.type}</td><td>{c.type === "percent" ? `${c.amount}%` : `$${(c.amount / 100).toFixed(2)}`}</td><td>${(c.minSpend / 100).toFixed(2)}</td><td>{c.usedCount}</td><td>{c.enabled ? "Enabled" : "Off"}</td></tr>))}</tbody></table></div>
        <form action={saveCoupon} className="card h-fit space-y-3 p-5">
          <h2 className="font-extrabold">Create coupon</h2>
          <div><label className="label">Code</label><input name="code" required placeholder="WELCOME10" className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Type</label><select name="type" className="input"><option value="percent">Percent %</option><option value="fixed">Fixed ¢</option><option value="freeship">Free ship</option></select></div>
            <div><label className="label">Amount</label><input name="amount" type="number" defaultValue={10} className="input" /></div>
          </div>
          <div><label className="label">Min spend ($)</label><input name="minSpend" type="number" step="0.01" defaultValue={99} className="input" /></div>
          <div><label className="label">Description</label><input name="description" className="input" /></div>
          <button className="btn-volt w-full">Save coupon</button>
        </form>
      </div>
    </AdminShell>
  );
}
