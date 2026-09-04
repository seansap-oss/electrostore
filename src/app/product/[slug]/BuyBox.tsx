"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart, useWishlist } from "@/lib/store";

export function BuyBox({ slug, title, image, price, inStock }: { slug: string; title: string; image: string; price: number; inStock: boolean }) {
  const add = useCart((s) => s.add);
  const { slugs, toggle } = useWishlist();
  const saved = slugs.includes(slug);
  const [qty, setQty] = useState(1);
  if (!inStock) {
    return (
      <form className="mt-4 flex gap-2" action="/api/back-in-stock" method="post" onSubmit={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("es:toast", { detail: "We'll email you when it's back!" })); }}>
        <input type="hidden" name="slug" value={slug} />
        <input name="email" type="email" required placeholder="Email for restock alert" className="input flex-1" aria-label="Email for restock alert" />
        <button className="btn-dark">Notify Me</button>
      </form>
    );
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-xl border" role="group" aria-label="Quantity">
        <button className="px-3 py-3" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
        <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
        <button className="px-3 py-3" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(9, q + 1))}>+</button>
      </div>
      <button className="btn-volt flex-1" onClick={() => { add({ slug, title, image, price, qty }); window.dispatchEvent(new CustomEvent("es:toast", { detail: "Added to cart" })); }}>Add to Cart</button>
      <Link className="btn-dark flex-1 text-center" href="/checkout" onClick={() => add({ slug, title, image, price, qty })}>Buy Now</Link>
      <button className="btn-ghost" aria-pressed={saved} onClick={() => { toggle(slug); window.dispatchEvent(new CustomEvent("es:toast", { detail: saved ? "Removed from wishlist" : "Saved to wishlist" })); }}>{saved ? "♥ Saved" : "♡ Wishlist"}</button>
    </div>
  );
}
