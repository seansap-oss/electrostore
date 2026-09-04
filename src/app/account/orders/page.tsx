import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtAUD } from "@/lib/pricing";
export const metadata = { title: "Order History" };
export default async function OrdersPage() {
  const s = await getSession();
  if (!s) redirect("/login?next=/account/orders");
  let orders: { id: string; orderNumber: string; total: number; status: string; createdAt: Date }[] = [];
  try { orders = await prisma.order.findMany({ where: { userId: s.sub }, orderBy: { createdAt: "desc" }, take: 50 }); } catch {}
  return (
    <div className="container-es py-8">
      <h1 className="text-3xl font-extrabold">Orders</h1>
      {orders.length === 0 ? (
        <div className="card mt-4 p-10 text-center"><h2 className="font-bold">You haven&apos;t placed an order yet.</h2><Link href="/" className="btn-volt mt-3">Shop deals</Link></div>
      ) : (
        <div className="card mt-4 overflow-x-auto"><table className="table-es min-w-[640px]"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (<tr key={o.id}><td className="font-bold">{o.orderNumber}</td><td>{new Date(o.createdAt).toLocaleDateString("en-AU")}</td><td><span className="chip">{o.status}</span></td><td className="font-bold">{fmtAUD(o.total)}</td><td><Link className="underline" href={`/account/orders/${o.orderNumber}`}>View</Link></td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}
