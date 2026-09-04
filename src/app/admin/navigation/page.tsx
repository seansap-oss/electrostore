import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Navigation" };

export default async function NavigationAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/navigation");
  let rows: { menu: string; label: string; url: string }[] = [];
  try { rows = await prisma.navigationItem.findMany({ orderBy: { sortOrder: "asc" }, take: 100 }); } catch {}
  const groups: Record<string, typeof rows> = {};
  for (const r of rows) { (groups[r.menu] ??= []).push(r); }
  return (
    <AdminShell title="Navigation" crumbs="Admin › Navigation">
      <p className="mb-3 text-sm text-charcoal-mute">Drag-and-drop nesting in full CMS — announcement, primary/mega-menu, footer, mobile. Each item: label, URL, icon, badge, visibility, schedule.</p>
      {Object.entries(groups).map(([menu, items]) => (
        <div key={menu} className="card mb-3 p-4"><h2 className="font-extrabold capitalize">{menu}</h2>
          <ul className="mt-1 text-sm">{items.map((i, k) => (<li key={k} className="py-0.5">☰ {i.label} <span className="text-charcoal-mute">→ {i.url}</span></li>))}</ul></div>))}
      {rows.length === 0 && <div className="card p-5 text-sm">Seed navigation with <code>npm run db:seed</code>.</div>}
    </AdminShell>
  );
}
