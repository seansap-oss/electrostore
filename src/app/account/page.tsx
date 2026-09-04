import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtAUD } from "@/lib/pricing";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const s = await getSession();
  if (!s) redirect("/login?next=/account");
  let orders: { orderNumber: string; total: number; status: string; createdAt: Date }[] = [];
  try {
    orders = await prisma.order.findMany({ where: { userId: s.sub }, orderBy: { createdAt: "desc" }, take: 5, select: { orderNumber: true, total: true, status: true, createdAt: true } });
  } catch { /* show empty state */ }
  return (
    <div className="container-es py-8">
      <h1 className="text-3xl font-extrabold">Hi{s.name ? `, ${s.name.split(" ")[0]}` : ""} 👋</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Orders", "/account/orders", "Track, invoice & returns"], ["Wishlist", "/account/wishlist", "Saved products"], ["Addresses", "/account/addresses", "Delivery addresses"], ["Returns", "/account/returns", "Requests & refunds"]].map(([t, u, d]) => (
          <Link key={u} href={u} className="card p-5 hover:shadow-pop"><div className="font-extrabold">{t}</div><div className="text-sm text-charcoal-mute">{d}</div></Link>
        ))}
      </div>
      <section className="card mt-6 p-5" aria-label="Recent orders">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Recent orders</h2><Link href="/account/orders" className="text-sm underline">View all</Link></div>
        {orders.length === 0 ? <p className="mt-2 text-sm text-charcoal-mute">You haven&apos;t placed an order yet. <Link href="/" className="underline">Start shopping</Link></p> :
          <ul className="mt-2 divide-y text-sm">{orders.map((o) => (<li key={o.orderNumber} className="flex justify-between py-2"><span className="font-bold">{o.orderNumber}</span><span className="text-charcoal-mute">{o.status}</span><span className="font-bold">{fmtAUD(o.total)}</span></li>))}</ul>}
      </section>
      <LogoutButton />
    </div>
  );
}
