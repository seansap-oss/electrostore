import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Media Library" };

export default async function MediaAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/media");
  let rows: { id: string; url: string; name: string }[] = [];
  try { rows = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 60 }); } catch {}
  return (
    <AdminShell title="Media Library" crumbs="Admin › Media">
      <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="card mb-3 flex flex-wrap items-center gap-2 p-4">
        <input type="file" name="file" accept="image/*,video/*" required className="input max-w-xs" aria-label="Upload media" />
        <button className="btn-volt !py-2 text-sm">Upload</button>
        <span className="text-xs text-charcoal-mute">JPG · PNG · WebP · AVIF · SVG · GIF · MP4 · WebM — validated, thumbnailed, responsive sizes.</span>
      </form>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {rows.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={m.url} alt={m.name} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="truncate p-2 text-xs">{m.name}</div>
          </div>))}
      </div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No uploads yet — category artwork ships in <code>/public/images</code> and is selectable from every editor.</p>}
    </AdminShell>
  );
}
