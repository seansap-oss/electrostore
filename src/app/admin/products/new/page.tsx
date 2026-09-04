import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { saveProduct } from "../../actions";
import { BRANDS, CATEGORIES } from "@/data/catalog";

export const metadata = { title: "New Product" };

export default async function NewProduct() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/products/new");
  let brands = BRANDS.map((b) => b.slug); let cats = CATEGORIES.map((c) => c.slug);
  try {
    const [b, c] = await Promise.all([prisma.brand.findMany({ select: { slug: true } }), prisma.category.findMany({ select: { slug: true } })]);
    if (b.length) brands = b.map((x) => x.slug);
    if (c.length) cats = c.map((x) => x.slug);
  } catch {}
  return (
    <AdminShell title="Create Product" crumbs="Admin › Products › New">
      <form action={saveProduct} className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">General</h2>
          <div><label className="label" htmlFor="title">Name *</label><input id="title" name="title" required className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="slug">Slug *</label><input id="slug" name="slug" required className="input" placeholder="my-product" /></div>
            <div><label className="label" htmlFor="sku">SKU *</label><input id="sku" name="sku" required className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="brand">Brand</label><select id="brand" name="brand" className="input">{brands.map((b) => (<option key={b} value={b}>{b}</option>))}</select></div>
            <div><label className="label" htmlFor="cat">Category</label><select id="cat" name="category" className="input">{cats.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
          </div>
          <div><label className="label" htmlFor="short">Short description</label><input id="short" name="short" className="input" /></div>
          <div><label className="label" htmlFor="desc">Description</label><textarea id="desc" name="desc" rows={5} className="input" /></div>
        </div>
        <div className="space-y-4">
          <div className="card space-y-3 p-5"><h2 className="font-extrabold">Pricing & Inventory</h2>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label" htmlFor="price">Price ($)</label><input id="price" name="price" required type="number" step="0.01" min="0" className="input" /></div>
              <div><label className="label" htmlFor="cmp">Compare ($)</label><input id="cmp" name="compareAt" type="number" step="0.01" min="0" className="input" /></div>
              <div><label className="label" htmlFor="sale">Sale ($)</label><input id="sale" name="sale" type="number" step="0.01" min="0" className="input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" defaultValue={10} className="input" /></div>
              <div><label className="label" htmlFor="status">Status</label><select id="status" name="status" className="input"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <label><input type="checkbox" name="featured" /> Featured</label>
              <label><input type="checkbox" name="best" /> Best seller</label>
              <label><input type="checkbox" name="isNew" /> New</label>
              <label><input type="checkbox" name="clearance" /> Clearance</label>
            </div>
          </div>
          <button className="btn-volt w-full">Publish product</button>
          <p className="text-xs text-charcoal-mute">Required: title, SKU, category, price and primary image (auto-generated from category; replace in Media after save).</p>
        </div>
      </form>
    </AdminShell>
  );
}
