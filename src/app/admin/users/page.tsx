import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Users & Roles" };

export default async function UsersAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/users");
  let users: { email: string; role: string; status: string }[] = [];
  let roles: { key: string; name: string; permissions: string }[] = [];
  try {
    users = await prisma.user.findMany({ take: 50, orderBy: { createdAt: "desc" } });
    roles = await prisma.role.findMany();
  } catch {}
  return (
    <AdminShell title="Users & Roles" crumbs="Admin › Users">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4"><h2 className="font-extrabold">Roles & permissions</h2>
          <ul className="mt-2 space-y-1 text-sm">{roles.map((r) => (<li key={r.key}><strong>{r.name}</strong> <span className="text-charcoal-mute">({r.key})</span></li>))}
            {roles.length === 0 && <li className="text-charcoal-mute">Super Admin · Administrator · Catalogue · Inventory · Orders · Marketing · Content · Support · Reporting — seeded on install.</li>}</ul></div>
        <div className="card overflow-x-auto p-4"><h2 className="font-extrabold">Administrators</h2>
          <table className="table-es"><thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>{users.filter((u) => u.role !== "customer").map((u) => (<tr key={u.email}><td>{u.email}</td><td>{u.role}</td><td>{u.status}</td></tr>))}</tbody></table></div>
      </div>
    </AdminShell>
  );
}
