import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { moderateReview } from "../actions";

export const metadata = { title: "Reviews" };

export default async function ReviewsAdmin() {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/reviews");
  let rows: { id: string; rating: number; headline: string | null; body: string | null; status: string; product: { title: string } }[] = [];
  try { rows = await prisma.review.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }, take: 100 }); } catch {}
  return (
    <AdminShell title="Reviews" crumbs="Admin › Reviews">
      <div className="card overflow-x-auto"><table className="table-es min-w-[680px]"><thead><tr><th>Product</th><th>Rating</th><th>Review</th><th>Status</th><th>Moderate</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.id}><td className="font-semibold">{r.product.title}</td><td>{"★".repeat(r.rating)}</td><td className="max-w-[320px] text-sm"><strong>{r.headline}</strong> {r.body}</td><td><span className="chip">{r.status}</span></td>
          <td className="flex gap-2"><form action={moderateReview.bind(null, r.id, "approved")}><button className="underline">Approve</button></form><form action={moderateReview.bind(null, r.id, "rejected")}><button className="text-danger underline">Reject</button></form></td></tr>))}</tbody></table></div>
      {rows.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">No reviews yet — moderation queue (approve / reject / hide / respond) lives here.</p>}
    </AdminShell>
  );
}
