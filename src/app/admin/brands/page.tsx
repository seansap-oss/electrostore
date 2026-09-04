import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { BRANDS } from "@/data/catalog";

export const metadata = { title: "Brands" };

export default async function BrandsAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/brands");
  let rows: { name: string; slug: string; active: boolean }[] = [];
  try { rows = await prisma.brand.findMany({ orderBy: { name: "asc" } }); } catch { rows = BRANDS.map((b) => ({ name: b.name, slug: b.slug, active: true })); }
  return (
    <AdminShell title="Brands" crumbs="Admin › Brands">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((b) => (
          <div key={b.slug} className="card p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/images/brands/${b.slug}.svg`} alt="" className="mx-auto h-10 object-contain" />
            <div className="mt-1 font-bold">{b.name}</div><div className="text-xs text-charcoal-mute">{b.active ? "Active" : "Hidden"}</div>
          </div>))}
      </div>
    </AdminShell>
  );
}
