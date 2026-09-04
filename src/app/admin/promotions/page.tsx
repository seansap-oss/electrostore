import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Promotions" };

export default async function PromotionsAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/promotions");
  let rows: { id: string; title: string; type: string; enabled: boolean }[] = [];
  try { rows = await prisma.promotion.findMany({ take: 50 }); } catch {}
  return (
    <AdminShell title="Promotions" crumbs="Admin › Promotions">
      <div className="card p-5">
        <h2 className="font-extrabold">Flash deals & campaigns</h2>
        <p className="text-sm text-charcoal-mute">Schedule percentage / fixed / free-shipping campaigns with countdowns. Sale prices on products auto-activate by date.</p>
        {rows.length === 0 ? <p className="mt-2 text-sm">Example: <strong>48 Hour Kitchen Event</strong> — create via hero + coupon + homepage blocks. Engine supports fixed, %, category, cart-threshold, BxGy and flash scheduling.</p> :
          <ul className="mt-2">{rows.map((r) => (<li key={r.id} className="py-1 text-sm font-semibold">{r.title} · {r.type}</li>))}</ul>}
      </div>
    </AdminShell>
  );
}
