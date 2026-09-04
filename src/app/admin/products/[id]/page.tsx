import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { saveProduct } from "../../actions";

export const metadata = { title: "Edit Product" };

export default async function EditProduct({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/products");
  type Prod = { id: string; title: string; slug: string; sku: string; price: number; compareAtPrice: number | null; salePrice: number | null; stock: number; status: string; shortDescription: string | null; description: string | null; featured: boolean; bestSeller: boolean; isNew: boolean; clearance: boolean; images: { id: string; url: string; alt: string | null }[] };
  let p: Prod | null = null;
  try { p = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sortOrder: "asc" } } } }) as unknown as Prod; } catch {}
  if (!p) notFound();
  const prod: Prod = p;
  return (
    <AdminShell title="Edit Product" crumbs="Admin › Products › Edit">
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_380px]">
        <form action={saveProduct} className="card space-y-3 p-5">
          <input type="hidden" name="id" value={prod.id} />
          <div><label className="label">Name</label><input name="title" required defaultValue={prod.title} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Slug</label><input name="slug" defaultValue={prod.slug} className="input" /></div>
            <div><label className="label">SKU</label><input name="sku" defaultValue={prod.sku} className="input" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Price ($)</label><input name="price" type="number" step="0.01" defaultValue={(prod.price / 100).toFixed(2)} className="input" /></div>
            <div><label className="label">Compare ($)</label><input name="compareAt" type="number" step="0.01" defaultValue={prod.compareAtPrice ? (prod.compareAtPrice / 100).toFixed(2) : ""} className="input" /></div>
            <div><label className="label">Sale ($)</label><input name="sale" type="number" step="0.01" defaultValue={prod.salePrice ? (prod.salePrice / 100).toFixed(2) : ""} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Stock</label><input name="stock" type="number" defaultValue={prod.stock} className="input" /></div>
            <div><label className="label">Status</label><select name="status" defaultValue={prod.status} className="input"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
          </div>
          <div><label className="label">Short</label><input name="short" defaultValue={prod.shortDescription ?? ""} className="input" /></div>
          <div><label className="label">Description</label><textarea name="desc" rows={5} defaultValue={prod.description ?? ""} className="input" /></div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <label><input type="checkbox" name="featured" defaultChecked={prod.featured} /> Featured</label>
            <label><input type="checkbox" name="best" defaultChecked={prod.bestSeller} /> Best seller</label>
            <label><input type="checkbox" name="isNew" defaultChecked={prod.isNew} /> New</label>
            <label><input type="checkbox" name="clearance" defaultChecked={prod.clearance} /> Clearance</label>
          </div>
          <input type="hidden" name="brand" value="" /><input type="hidden" name="category" value="" />
          <button className="btn-volt">Save changes</button>
        </form>
        <ProductImageManager productId={prod.id} images={prod.images} />
      </div>
    </AdminShell>
  );
}
