import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaManager } from "@/components/admin/MediaManager";

export const metadata = { title: "Media Library" };

export default async function MediaAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/media");
  let rows: { id: string; url: string; name: string }[] = [];
  try { rows = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 }); } catch {}
  return (
    <AdminShell title="Media Library" crumbs="Admin › Media">
      <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="card mb-3 flex flex-wrap items-center gap-2 p-4">
        <input type="file" name="file" accept="image/*,video/*" required className="input max-w-xs" aria-label="Upload media" />
        <button className="btn-volt !py-2 text-sm">Upload</button>
        <span className="text-xs text-charcoal-mute">JPG · PNG · WebP · AVIF · SVG · GIF · MP4 · WebM — validated, max 25MB. Deleting a file in use shows a warning first.</span>
      </form>
      <MediaManager items={rows} />
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No media yet — upload a file or add by URL above.</p>}
    </AdminShell>
  );
}
