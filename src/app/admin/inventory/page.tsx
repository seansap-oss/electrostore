import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adjustStock } from "../actions";

export const metadata = { title: "Inventory" };

export default async function InventoryAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/inventory");
  let rows: { id: string; title: string; sku: string; stock: number; lowStockAt: number }[] = [];
  try { rows = await prisma.product.findMany({ where: { deletedAt: null }, orderBy: { stock: "asc" }, take: 100, select: { id: true, title: true, sku: true, stock: true, lowStockAt: true } }); } catch {}
  return (
    <AdminShell title="Inventory" crumbs="Admin › Inventory">
      <div className="card overflow-x-auto"><table className="table-es min-w-[680px]">
        <thead><tr><th>SKU</th><th>Product</th><th>On hand</th><th>Status</th><th>Adjust</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id}><td className="font-mono text-xs">{r.sku}</td><td className="font-semibold">{r.title}</td><td className="font-bold">{r.stock}</td>
            <td>{r.stock === 0 ? <span className="badge-sale">OUT</span> : r.stock <= r.lowStockAt ? <span className="chip !bg-volt">LOW</span> : <span className="chip">OK</span>}</td>
            <td><form action={adjustStock.bind(null, r.id, 10, "Manual top-up")} className="inline"><button className="underline">+10</button></form>{" · "}
              <form action={adjustStock.bind(null, r.id, -1, "Manual correction")} className="inline"><button className="underline">−1</button></form></td></tr>))}
        </tbody></table></div>
      <p className="mt-2 text-xs text-charcoal-mute">Every adjustment writes a stock-movement record — stock is never silently overwritten.</p>
    </AdminShell>
  );
}
