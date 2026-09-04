import Link from "next/link";
const LINKS: [string, string][] = [
  ["Dashboard", "/admin/dashboard"], ["Orders", "/admin/orders"], ["Products", "/admin/products"],
  ["Categories", "/admin/categories"], ["Brands", "/admin/brands"], ["Inventory", "/admin/inventory"],
  ["Customers", "/admin/customers"], ["Promotions", "/admin/promotions"], ["Coupons", "/admin/coupons"],
  ["Homepage", "/admin/homepage"], ["Hero", "/admin/homepage/hero"], ["Navigation", "/admin/navigation"],
  ["Media", "/admin/media"], ["Reviews", "/admin/reviews"], ["Returns", "/admin/returns"],
  ["Pages", "/admin/pages"], ["Reports", "/admin/reports"], ["Settings", "/admin/settings"],
  ["Users & Roles", "/admin/users"], ["Audit Log", "/admin/audit-log"]
];
export function AdminShell({ title, crumbs, children, actions }: { title: string; crumbs?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="container-es grid gap-4 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="card h-fit p-2 lg:sticky lg:top-32" aria-label="Admin navigation">
        <div className="px-3 py-2 text-xs font-bold uppercase text-charcoal-mute">Electrostore Admin</div>
        <nav className="grid gap-0.5">
          {LINKS.map(([t, u]) => (<Link key={u} href={u} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-mist">{t}</Link>))}
        </nav>
        <Link href="/" className="mt-2 block rounded-xl px-3 py-2 text-sm text-charcoal-mute hover:bg-mist">← View storefront</Link>
      </aside>
      <section>
        {crumbs && <div className="text-xs text-charcoal-mute">{crumbs}</div>}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-extrabold">{title}</h1><div className="flex gap-2">{actions}</div>
        </div>
        {children}
      </section>
    </div>
  );
}
