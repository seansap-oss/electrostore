import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { savePage } from "../actions";

export const metadata = { title: "Pages" };

export default async function PagesAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/pages");
  let rows: { slug: string; title: string; status: string }[] = [];
  try { rows = await prisma.sitePage.findMany({ take: 50 }); } catch {}
  return (
    <AdminShell title="Pages" crumbs="Admin › Pages">
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-x-auto"><table className="table-es min-w-[480px]"><thead><tr><th>Title</th><th>Slug</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((p) => (<tr key={p.slug}><td className="font-bold">{p.title}</td><td className="font-mono text-xs">{p.slug}</td><td>{p.status}</td><td><a className="underline" href={`/page/${p.slug}`}>View</a></td></tr>))}</tbody></table></div>
        <form action={savePage} className="card h-fit space-y-3 p-5">
          <h2 className="font-extrabold">Create / edit page</h2>
          <div><label className="label">Slug</label><input name="slug" required className="input" placeholder="about" /></div>
          <div><label className="label">Title</label><input name="title" required className="input" /></div>
          <div><label className="label">Body</label><textarea name="body" rows={6} className="input" /></div>
          <button className="btn-volt w-full">Publish page</button>
        </form>
      </div>
    </AdminShell>
  );
}
