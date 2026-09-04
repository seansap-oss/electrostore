"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { fmtAUD } from "@/lib/pricing";

const STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export default function CheckoutPage() {
  const { lines, subtotal, coupon, clear } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", street: "", suburb: "", state: "NSW", postcode: "", mobile: "", email: "", method: "standard", provider: "stripe" });
  const sub = subtotal();
  const shipping = useMemo(() => (form.method === "express" ? 1499 : sub >= 9900 || coupon === "FREESHIP99" ? 0 : 990), [form.method, sub, coupon]);
  const total = sub + shipping;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!lines.length) return <div className="container-es py-16 text-center"><h1 className="text-2xl font-extrabold">Your cart is empty.</h1><a href="/" className="btn-volt mt-4">Shop deals</a></div>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ slug: l.slug, qty: l.qty, variant: l.variant })),
          address: { ...form, country: "AU", unit: "", company: "", instructions: "" },
          shippingMethod: form.method, coupon, paymentProvider: form.provider,
          idempotencyKey: `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Checkout failed");
      clear();
      router.push(`/checkout/success?order=${j.orderNumber}`);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Checkout failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="container-es grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="space-y-4">
        <h1 className="text-3xl font-extrabold">Secure checkout</h1>
        {err && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">{err}</div>}
        <section className="card p-5" aria-label="Customer details">
          <h2 className="font-extrabold">1 · Customer details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="email">Email</label><input id="email" required type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className="label" htmlFor="mobile">Mobile</label><input id="mobile" required className="input" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div><label className="label" htmlFor="fn">First name</label><input id="fn" required className="input" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
            <div><label className="label" htmlFor="ln">Last name</label><input id="ln" required className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
          </div>
        </section>
        <section className="card p-5" aria-label="Shipping address">
          <h2 className="font-extrabold">2 · Shipping address</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="street">Address</label><input id="street" required className="input" value={form.street} onChange={(e) => set("street", e.target.value)} /></div>
            <div><label className="label" htmlFor="suburb">Suburb</label><input id="suburb" required className="input" value={form.suburb} onChange={(e) => set("suburb", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="state">State</label><select id="state" className="input" value={form.state} onChange={(e) => set("state", e.target.value)}>{STATES.map((s) => (<option key={s}>{s}</option>))}</select></div>
              <div><label className="label" htmlFor="pc">Postcode</label><input id="pc" required pattern="\d{4}" inputMode="numeric" className="input" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} /></div>
            </div>
          </div>
        </section>
        <section className="card p-5" aria-label="Delivery and payment">
          <h2 className="font-extrabold">3 · Delivery & payment</h2>
          <div className="mt-3 grid gap-2">
            {[["standard", `Standard (2–7 days) — ${shipping === 0 && form.method === "standard" ? "FREE" : "$9.90"}`], ["express", "Express (1–3 days) — $14.99"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold"><input type="radio" name="method" checked={form.method === v} onChange={() => set("method", v)} />{l}</label>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["stripe", "paypal", "applepay", "googlepay"].map((p) => (
              <label key={p} className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold capitalize"><input type="radio" name="prov" checked={form.provider === p} onChange={() => set("provider", p)} />{p}</label>
            ))}
          </div>
          <p className="mt-2 text-xs text-charcoal-mute">Demo checkout — no real charge. Connect Stripe keys in <code>.env</code> for live payments. Cards are tokenised; we never store raw numbers.</p>
        </section>
        <button disabled={busy} className="btn-volt w-full text-lg">{busy ? "Placing order…" : `Pay ${fmtAUD(total)}`}</button>
      </form>
      <aside className="card h-fit p-5">
        <h2 className="font-extrabold">Review ({lines.length})</h2>
        {lines.map((l) => (<div key={l.slug} className="mt-2 flex justify-between gap-2 text-sm"><span className="truncate">{l.qty}× {l.title}</span><span className="font-bold">{fmtAUD(l.price * l.qty)}</span></div>))}
        <hr className="my-3" />
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{fmtAUD(sub)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? "FREE" : fmtAUD(shipping)}</span></div>
        <div className="mt-2 flex justify-between text-lg font-extrabold"><span>Total</span><span>{fmtAUD(total)}</span></div>
        <p className="text-xs text-charcoal-mute">GST included. Receipt emailed after payment.</p>
      </aside>
    </div>
  );
}
