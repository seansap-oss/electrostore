"use client";
import Link from "next/link";
import { useWishlist } from "@/lib/store";
import { PRODUCTS } from "@/data/catalog";
export default function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  const items = PRODUCTS.filter((p) => slugs.includes(p.slug));
  if (!items.length) return <div className="container-es py-16 text-center"><div className="card mx-auto max-w-md p-10"><div className="text-5xl">♡</div><h1 className="mt-2 text-2xl font-extrabold">Your wishlist is ready for something great.</h1><Link href="/" className="btn-volt mt-4">Discover products</Link></div></div>;
  return (
    <div className="container-es py-8"><h1 className="text-3xl font-extrabold">Wishlist ({items.length})</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map((p) => (
        <div key={p.slug} className="card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/images/cats/${p.category}.svg`} alt="" className="aspect-square w-full rounded-xl bg-mist object-contain p-4" />
          <Link href={`/product/${p.slug}`} className="mt-2 block text-sm font-bold hover:underline">{p.title}</Link>
          <div className="text-sm font-extrabold">${((p.sale ?? p.price) / 100).toFixed(2)}</div>
          <button className="mt-2 text-sm underline" onClick={() => toggle(p.slug)}>Remove</button>
        </div>))}</div></div>
  );
}
