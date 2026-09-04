import Link from "next/link";
export const metadata = { title: "Help Centre" };
const CATS = [["Orders", "Track, change and invoice"], ["Shipping", "Delivery times & postcodes"], ["Payments", "Cards, wallets & Afterpay"], ["Returns", "30-day returns & refunds"], ["Warranty", "Manufacturer + AU law"], ["Accounts", "Sign in & security"], ["Products", "Specs & stock"], ["Technical Support", "Setup & troubleshooting"]];
export default function HelpPage() {
  return (
    <div className="container-es py-8">
      <h1 className="text-3xl font-extrabold">Help Centre</h1>
      <p className="text-sm text-charcoal-mute">How can we help? Support 7 days, 8am–8pm AEST.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATS.map(([t, d]) => (<Link key={t} href="/contact" className="card p-5 hover:shadow-pop"><div className="font-extrabold">{t}</div><div className="text-sm text-charcoal-mute">{d}</div></Link>))}
      </div>
      <div className="card mt-6 p-6"><h2 className="font-extrabold">Popular answers</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Track your order from <Link href="/account/orders" className="underline">Orders</Link> with your order number (e.g. EL-260904-48291).</li>
          <li>Free standard delivery over $99 on eligible products; express at checkout.</li>
          <li>30-day change-of-mind returns on eligible items; faults covered under Australian Consumer Law.</li>
        </ul></div>
    </div>
  );
}
