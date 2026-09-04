"use client";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { fmtAUD } from "@/lib/pricing";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, coupon, setCoupon } = useCart();
  if (!lines.length) {
    return (
      <div className="container-es py-16 text-center">
        <div className="mx-auto max-w-md card p-10">
          <div className="text-5xl" aria-hidden>🛒</div>
          <h1 className="mt-3 text-2xl font-extrabold">Your cart is currently empty.</h1>
          <p className="text-sm text-charcoal-mute">Fill it with something great — deals update daily.</p>
          <Link href="/" className="btn-volt mt-4">Start shopping</Link>
        </div>
      </div>
    );
  }
  const sub = subtotal();
  return (
    <div className="container-es grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-3xl font-extrabold">Your cart ({lines.reduce((a, l) => a + l.qty, 0)})</h1>
        <div className="mt-4 space-y-3">
          {lines.map((l) => (
            <div key={l.slug + (l.variant ?? "")} className="card flex gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.image} alt="" className="h-20 w-20 rounded-xl bg-mist object-contain" />
              <div className="flex-1">
                <Link href={`/product/${l.slug}`} className="font-bold hover:underline">{l.title}</Link>
                <div className="text-sm font-extrabold">{fmtAUD(l.price)} <span className="font-normal text-charcoal-mute">each</span></div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="rounded-lg border px-2 py-1" aria-label="Decrease" onClick={() => setQty(l.slug, l.qty - 1, l.variant)}>−</button>
                  <span className="w-6 text-center font-bold">{l.qty}</span>
                  <button className="rounded-lg border px-2 py-1" aria-label="Increase" onClick={() => setQty(l.slug, l.qty + 1, l.variant)}>+</button>
                  <button className="ml-2 text-sm underline" onClick={() => remove(l.slug, l.variant)}>Remove</button>
                </div>
              </div>
              <div className="font-extrabold">{fmtAUD(l.price * l.qty)}</div>
            </div>
          ))}
        </div>
      </div>
      <aside className="card h-fit p-5">
        <h2 className="font-extrabold">Order summary</h2>
        <div className="mt-2 flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">{fmtAUD(sub)}</span></div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("es:toast", { detail: coupon ? "Coupon applied" : "Enter a coupon code" })); }}>
          <input value={coupon ?? ""} onChange={(e) => setCoupon(e.target.value.toUpperCase() || null)} placeholder="Coupon (try WELCOME10)" className="input" aria-label="Coupon code" />
          <button className="btn-ghost !py-2">Apply</button>
        </form>
        <p className="mt-2 text-xs text-charcoal-mute">Shipping calculated at checkout. Free standard over $99*.</p>
        <Link href="/checkout" className="btn-volt mt-4 w-full">Checkout securely</Link>
        <Link href="/" className="mt-2 block text-center text-sm underline">Continue shopping</Link>
      </aside>
    </div>
  );
}
