import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { fmtAUD } from "@/lib/pricing";
import { deleteProduct } from "../actions";

export const metadata = { title: "Products" };

export default async function ProductsAdmin({ searchParams }: { searchParams: { q?: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/products");
  let rows: { id: string; sku: string; title: string; price: number; stock: number; status: string; brand?: { name: string } | null; images: { url: string }[] }[] = [];
  try {
    rows = await prisma.product.findMany({
      where: searchParams.q ? { OR: [{ title: { contains: searchParams.q } }, { sku: { contains: searchParams.q.toUpperCase() } }] } : { deletedAt: null },
      include: { brand: true, images: { take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100
    });
  } catch {}
  return (
    <AdminShell title="Products" crumbs="Admin › Products" actions={<Link href="/admin/products/new" className="btn-volt !py-2 text-sm">+ Create Product</Link>}>
      <form method="get" className="mb-3 flex gap-2"><input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search title or SKU…" className="input max-w-xs" aria-label="Search products" /><button className="btn-ghost !py-2">Search</button></form>
      <div className="card overflow-x-auto"><table className="table-es min-w-[820px]">
        <thead><tr><th></th><th>SKU</th><th>Title</th><th>Brand</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}<td><img src={r.images[0]?.url ?? "/images/placeholder.svg"} alt="" className="h-10 w-10 rounded-lg bg-mist object-contain" /></td>
            <td className="font-mono text-xs">{r.sku}</td><td className="font-semibold">{r.title}</td><td>{r.brand?.name}</td>
            <td className="font-bold">{fmtAUD(r.price)}</td><td>{r.stock}</td><td><span className="chip">{r.status}</span></td>
            <td className="flex gap-2"><Link href={`/admin/products/${r.id}`} className="underline">Edit</Link>
              <form action={deleteProduct.bind(null, r.id)}><button className="text-danger underline">Archive</button></form></td>
          </tr>))}
        </tbody></table></div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No products found.</p>}
    </AdminShell>
  );
}
