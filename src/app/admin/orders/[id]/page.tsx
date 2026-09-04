import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSession, isStaffRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { setOrderStatus } from "../../actions";
import { fmtAUD } from "@/lib/pricing";

const STATUSES = ["Pending", "Payment Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Refunded"];

export default async function OrderDetailAdmin({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/orders");
  type OrderView = { id: string; orderNumber: string; email: string; status: string; total: number; addressJson: string; items: { title: string; qty: number; unitPrice: number }[]; timeline: { status: string; createdAt: Date }[] };
  let o: OrderView | null = null;
  try { o = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true, timeline: { orderBy: { createdAt: "asc" } } } }) as unknown as OrderView; } catch {}
  if (!o) notFound();
  return (
    <AdminShell title={o.orderNumber} crumbs="Admin › Orders › Detail">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-1 p-5">
          <h2 className="font-extrabold">Items · {fmtAUD(o.total)}</h2>
          {o.items.map((i, k) => (<div key={k} className="flex justify-between text-sm"><span>{i.qty}× {i.title}</span><span className="font-bold">{fmtAUD(i.unitPrice * i.qty)}</span></div>))}
          <p className="pt-2 text-xs text-charcoal-mute">Ship to: {o.addressJson.slice(0, 160)}</p>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-extrabold">Fulfilment · {o.status}</h2>
          <form action={setOrderStatus.bind(null, o.id, "Shipped")}><button className="btn-dark w-full">Mark shipped + add tracking</button></form>
          <form action={setOrderStatus.bind(null, o.id, "Delivered")}><button className="btn-ghost w-full">Mark delivered</button></form>
          <form action={setOrderStatus.bind(null, o.id, "Refunded")}><button className="w-full rounded-xl border border-red-200 p-3 font-semibold text-danger">Refund order</button></form>
          <div className="flex flex-wrap gap-2">{STATUSES.map((st) => (<form key={st} action={setOrderStatus.bind(null, o!.id, st)}><button className="chip hover:bg-volt">{st}</button></form>))}</div>
          <h3 className="font-bold">Timeline</h3>
          <ul className="space-y-1 text-sm">{o.timeline.map((t, k) => (<li key={k}>● {t.status} <span className="text-charcoal-mute">{new Date(t.createdAt).toLocaleString("en-AU")}</span></li>))}</ul>
        </div>
      </div>
    </AdminShell>
  );
}
