import { redirect } from "next/navigation";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Hero Manager" };

export default async function HeroAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/homepage/hero");
  return (
    <AdminShell title="Hero Manager" crumbs="Admin › Homepage › Hero">
      <form className="grid max-w-3xl gap-4" action="/api/admin/upload" method="post" encType="multipart/form-data">
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">Campaign</h2>
          <div><label className="label">Campaign name</label><input defaultValue="Weekend Tech Sale" className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Headline</label><input defaultValue="Upgrade Your Everyday" className="input" /></div>
            <div><label className="label">Sub copy</label><input defaultValue="Smart technology at great prices." className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">CTA label</label><input defaultValue="Shop Hot Deals" className="input" /></div>
            <div><label className="label">CTA URL</label><input defaultValue="/search?q=sale" className="input" /></div>
          </div>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">Media (uploader — desktop / tablet / mobile / MP4 + poster)</h2>
          <input type="file" name="file" accept="image/*,video/mp4,video/webm" className="input" aria-label="Upload hero media" />
          <p className="text-xs text-charcoal-mute">Muted autoplay, playsinline, loop, poster, reduced-motion pause. Media Library picker available in full CMS.</p>
        </div>
        <button className="btn-volt max-w-xs">Publish hero</button>
      </form>
    </AdminShell>
  );
}
