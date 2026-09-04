import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { UrlWithUpload } from "@/components/admin/UrlWithUpload";
import { saveHero } from "../../actions";

export const metadata = { title: "Hero Manager" };

const DEFAULTS = {
  badge: "Weekend Tech Sale", headline: "Upgrade Your Everyday",
  body: "Smart technology, powerful appliances and everyday essentials at great prices.",
  cta: "Shop Hot Deals", url: "/search?q=sale", cta2: "Explore Kitchen", url2: "/category/kitchen",
  image1: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=70",
  image2: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=70"
};

export default async function HeroAdmin({ searchParams }: { searchParams: { saved?: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/homepage/hero");
  let h = { ...DEFAULTS };
  try {
    const row = await prisma.homepageSection.findFirst({ where: { kind: "hero" } });
    if (row) h = { ...h, ...JSON.parse(row.config) };
  } catch {}
  return (
    <AdminShell title="Hero Manager" crumbs="Admin › Homepage › Hero">
      {searchParams.saved && <div className="card mb-3 border-green-200 bg-green-50 p-3 text-sm font-bold text-success">Hero published — live on the homepage.</div>}
      <form action={saveHero} className="grid max-w-3xl gap-4">
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">Campaign copy</h2>
          <div><label className="label" htmlFor="badge">Badge</label><input id="badge" name="badge" defaultValue={h.badge} className="input" /></div>
          <div><label className="label" htmlFor="headline">Headline</label><input id="headline" name="headline" defaultValue={h.headline} className="input" /></div>
          <div><label className="label" htmlFor="body">Supporting copy</label><textarea id="body" name="body" rows={2} defaultValue={h.body} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="cta">CTA label</label><input id="cta" name="cta" defaultValue={h.cta} className="input" /></div>
            <div><label className="label" htmlFor="url">CTA URL</label><input id="url" name="url" defaultValue={h.url} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="cta2">Secondary CTA</label><input id="cta2" name="cta2" defaultValue={h.cta2} className="input" /></div>
            <div><label className="label" htmlFor="url2">Secondary URL</label><input id="url2" name="url2" defaultValue={h.url2} className="input" /></div>
          </div>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">Hero images (paste a URL link or upload)</h2>
          <UrlWithUpload name="image1" label="Image 1" defaultValue={h.image1} hint="Wide lifestyle shot works best (TV lounge, kitchen)." />
          <UrlWithUpload name="image2" label="Image 2" defaultValue={h.image2} />
        </div>
        <button className="btn-volt max-w-xs">Publish hero</button>
      </form>
    </AdminShell>
  );
}
