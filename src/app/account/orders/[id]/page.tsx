import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtAUD } from "@/lib/pricing";
export async function generateMetadata({ params }: { params: { id: string } }) { return { title: `Order ${params.id}` }; }
export default async function OrderDetail({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) redirect("/login");
  type OrderView = { orderNumber: string; status: string; total: number; subtotal: number; shipping: number; discount: number; createdAt: Date; tracking?: string | null; items: { title: string; qty: number; unitPrice: number }[] };
  let order: OrderView | null = null;
  try {
    const o = await prisma.order.findUnique({ where: { orderNumber: params.id }, include: { items: true } });
    if (o && (o.userId === s.sub || s.role !== "customer")) order = o as unknown as OrderView;
  } catch {}
  if (!order) notFound();
  return (
    <div className="container-es max-w-3xl py-8">
      <Link href="/account/orders" className="text-sm underline">← All orders</Link>
      <h1 className="mt-1 text-3xl font-extrabold">{order.orderNumber}</h1>
      <p className="text-sm text-charcoal-mute">{order.status} · {new Date(order.createdAt).toLocaleString("en-AU")}{order.tracking ? ` · Tracking ${order.tracking}` : ""}</p>
      <div className="card mt-4 divide-y p-5">
        {order.items.map((i, k) => (<div key={k} className="flex justify-between py-2 text-sm"><span>{i.qty}× {i.title}</span><span className="font-bold">{fmtAUD(i.unitPrice * i.qty)}</span></div>))}
        <div className="flex justify-between pt-3 text-sm"><span>Subtotal</span><span>{fmtAUD(order.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{fmtAUD(order.shipping)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span>−{fmtAUD(order.discount)}</span></div>}
        <div className="flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span>{fmtAUD(order.total)}</span></div>
      </div>
      <Link href="/account/returns" className="btn-ghost mt-4">Request a return</Link>
    </div>
  );
}
