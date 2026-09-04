import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { saveProduct } from "../../actions";

export const metadata = { title: "Edit Product" };

export default async function EditProduct({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/products");
  let p: { id: string; title: string; slug: string; sku: string; price: number; compareAtPrice: number | null; salePrice: number | null; stock: number; status: string; shortDescription: string | null; description: string | null; featured: boolean; bestSeller: boolean; isNew: boolean; clearance: boolean } | null = null;
  try { p = await prisma.product.findUnique({ where: { id: params.id } }); } catch {}
  if (!p) notFound();
  return (
    <AdminShell title="Edit Product" crumbs="Admin › Products › Edit">
      <form action={saveProduct} className="card max-w-2xl space-y-3 p-5">
        <input type="hidden" name="id" value={p.id} />
        <div><label className="label">Name</label><input name="title" required defaultValue={p.title} className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Slug</label><input name="slug" defaultValue={p.slug} className="input" /></div>
          <div><label className="label">SKU</label><input name="sku" defaultValue={p.sku} className="input" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Price ($)</label><input name="price" type="number" step="0.01" defaultValue={(p.price / 100).toFixed(2)} className="input" /></div>
          <div><label className="label">Compare ($)</label><input name="compareAt" type="number" step="0.01" defaultValue={p.compareAtPrice ? (p.compareAtPrice / 100).toFixed(2) : ""} className="input" /></div>
          <div><label className="label">Sale ($)</label><input name="sale" type="number" step="0.01" defaultValue={p.salePrice ? (p.salePrice / 100).toFixed(2) : ""} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Stock</label><input name="stock" type="number" defaultValue={p.stock} className="input" /></div>
          <div><label className="label">Status</label><select name="status" defaultValue={p.status} className="input"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
        </div>
        <div><label className="label">Short</label><input name="short" defaultValue={p.shortDescription ?? ""} className="input" /></div>
        <div><label className="label">Description</label><textarea name="desc" rows={5} defaultValue={p.description ?? ""} className="input" /></div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <label><input type="checkbox" name="featured" defaultChecked={p.featured} /> Featured</label>
          <label><input type="checkbox" name="best" defaultChecked={p.bestSeller} /> Best seller</label>
          <label><input type="checkbox" name="isNew" defaultChecked={p.isNew} /> New</label>
          <label><input type="checkbox" name="clearance" defaultChecked={p.clearance} /> Clearance</label>
        </div>
        <input type="hidden" name="brand" value="" /><input type="hidden" name="category" value="" />
        <button className="btn-volt">Save changes</button>
      </form>
    </AdminShell>
  );
}
