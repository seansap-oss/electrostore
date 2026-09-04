import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Homepage Builder" };

export default async function HomepageAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/homepage");
  let rows: { id: string; kind: string; title: string | null; enabled: boolean; sortOrder: number }[] = [];
  try { rows = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }); } catch {}
  return (
    <AdminShell title="Homepage Builder" crumbs="Admin › Homepage">
      <p className="mb-3 text-sm text-charcoal-mute">Manage every homepage block — hero, banners, carousels, tiles, countdown, newsletter — add / hide / reorder / schedule, no code.</p>
      <div className="space-y-2">{rows.map((r) => (
        <div key={r.id} className="card flex items-center gap-3 p-3">
          <span className="text-charcoal-mute">☰</span>
          <span className="chip">{r.kind}</span>
          <span className="flex-1 font-bold">{r.title}</span>
          <span className="text-xs">{r.enabled ? "Visible" : "Hidden"}</span>
        </div>))}
        {rows.length === 0 && <div className="card p-6 text-sm">Default blocks: Hero → Benefits → Categories → Hot Deals → Tiles → Kitchen → Smart Home → TV → Brands → New → Newsletter. Run <code>npm run db:seed</code> to populate.</div>}
      </div>
    </AdminShell>
  );
}
