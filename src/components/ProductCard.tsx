"use client";
import Link from "next/link";
import { effectivePrice, fmtAUD, savings } from "@/lib/pricing";
import { FavButton } from "./FavButton";

export type CardProduct = {
  slug: string; title: string; brand?: string | null;
  price: number; salePrice?: number | null; compareAtPrice?: number | null;
  saleStart?: string | null; saleEnd?: string | null;
  ratingAvg?: number; ratingCount?: number;
  image?: string | null; bestSeller?: boolean; isNew?: boolean; clearance?: boolean; onlineOnly?: boolean; stock?: number;
};

export function badges(p: CardProduct) {
  const out: string[] = [];
  const s = savings({ price: p.price, salePrice: p.salePrice, compareAtPrice: p.compareAtPrice, saleStart: p.saleStart, saleEnd: p.saleEnd });
  if (s.saved > 0) out.push("SALE");
  if (p.clearance) out.push("CLEARANCE");
  if (p.isNew) out.push("NEW");
  if (p.bestSeller) out.push("BEST SELLER");
  if (p.onlineOnly) out.push("ONLINE ONLY");
  if ((p.stock ?? 99) <= 5 && (p.stock ?? 99) > 0) out.push("LOW STOCK");
  return out;
}

export function ProductCard({ p }: { p: CardProduct }) {
  const eff = effectivePrice(p as never);
  const s = savings({ price: p.price, salePrice: p.salePrice, compareAtPrice: p.compareAtPrice, saleStart: p.saleStart, saleEnd: p.saleEnd });
  return (
    <div className="card group relative flex flex-col overflow-hidden p-3 transition hover:shadow-pop">
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {badges(p).slice(0, 2).map((b) => (
          <span key={b} className={b === "SALE" || b === "CLEARANCE" ? "badge-sale" : "chip"}>{b}</span>
        ))}
      </div>
      <FavButton slug={p.slug} />
      <Link href={`/product/${p.slug}`} className="block overflow-hidden rounded-xl bg-mist" aria-label={p.title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image ?? "/images/placeholder.svg"} alt={p.title} loading="lazy"
          className="aspect-square w-full object-contain p-4 transition duration-300 group-hover:scale-[1.04]" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        {p.brand && <div className="text-[11px] font-bold uppercase tracking-wide text-charcoal-mute">{p.brand}</div>}
        <Link href={`/product/${p.slug}`} className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-snug hover:underline">
          {p.title}
        </Link>
        <div className="text-xs text-charcoal-mute" aria-label={`Rated ${p.ratingAvg?.toFixed(1) ?? "—"}`}>
          ★ {(p.ratingAvg ?? 4.5).toFixed(1)} <span>({p.ratingCount ?? 0})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-extrabold">{fmtAUD(eff)}</span>
          {s.was && <span className="text-sm text-charcoal-mute line-through">{fmtAUD(s.was)}</span>}
        </div>
        {s.saved > 0 && <div className="text-xs font-bold text-success">Save {fmtAUD(s.saved)} ({s.pct}%)</div>}
        <div className="pt-2">
          <AddButton slug={p.slug} title={p.title} image={p.image ?? "/images/placeholder.svg"} price={eff} />
        </div>
      </div>
    </div>
  );
}

import { useCart } from "@/lib/store";
function AddButton({ slug, title, image, price }: { slug: string; title: string; image: string; price: number }) {
  const add = useCart((s) => s.add);
  return (
    <button className="btn-volt w-full !py-2.5 text-sm"
      onClick={() => { add({ slug, title, image, price, qty: 1 }); window.dispatchEvent(new CustomEvent("es:toast", { detail: "Added to cart" })); }}>
      Add to Cart
    </button>
  );
}
