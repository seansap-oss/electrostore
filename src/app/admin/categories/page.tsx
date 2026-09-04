import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { saveCategory } from "../actions";
import { CATEGORIES } from "@/data/catalog";

export const metadata = { title: "Categories" };

export default async function CategoriesAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/categories");
  let rows: { id: string; title: string; slug: string; showOnHome: boolean; status: string }[] = [];
  try { rows = await prisma.category.findMany({ orderBy: { title: "asc" }, take: 100 }); } catch { rows = CATEGORIES.map((c, i) => ({ id: String(i), title: c.title, slug: c.slug, showOnHome: !!c.showOnHome, status: "active" })); }
  return (
    <AdminShell title="Categories" crumbs="Admin › Categories">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card overflow-x-auto"><table className="table-es min-w-[520px]"><thead><tr><th>Title</th><th>Slug</th><th>Home</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r) => (<tr key={r.slug}><td className="font-bold">{r.title}</td><td className="font-mono text-xs">{r.slug}</td><td>{r.showOnHome ? "✓" : ""}</td><td>{r.status}</td></tr>))}</tbody></table></div>
        <form action={saveCategory} className="card h-fit space-y-3 p-5">
          <h2 className="font-extrabold">Create category</h2>
          <div><label className="label">Title</label><input name="title" required className="input" /></div>
          <div><label className="label">Slug</label><input name="slug" required className="input" /></div>
          <div><label className="label">Description</label><input name="description" className="input" /></div>
          <label className="text-sm font-semibold"><input type="checkbox" name="showOnHome" /> Show on homepage</label>
          <button className="btn-volt w-full">Create</button>
        </form>
      </div>
    </AdminShell>
  );
}
