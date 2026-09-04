import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { fmtAUD, effectivePrice, savings } from "@/lib/pricing";
import { fallbackProduct, allCards } from "@/lib/catalog-server";
import { ProductCard } from "@/components/ProductCard";
import { BuyBox } from "./BuyBox";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: params.slug.replace(/-/g, " ") };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let p: {
    slug: string; title: string; sku: string; brand: string | null; brandSlug?: string;
    price: number; salePrice: number | null; compareAtPrice: number | null;
    stock: number; short: string | null; desc: string | null; image: string;
    category: string; categorySlug: string; ratingAvg: number; ratingCount: number;
    images?: string[];
  } | null = null;
  try {
    const row = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true, brand: true, categories: { include: { category: true } }, reviews: { where: { status: "approved" }, take: 6, orderBy: { createdAt: "desc" } } }
    });
    if (row) {
      p = {
        slug: row.slug, title: row.title, sku: row.sku, brand: row.brand?.name ?? null, brandSlug: row.brand?.slug,
        price: row.price, salePrice: row.salePrice, compareAtPrice: row.compareAtPrice,
        stock: row.stock, short: row.shortDescription, desc: row.description,
        image: row.images[0]?.url ?? "/images/placeholder.svg",
        images: row.images.map((i) => i.url),
        category: row.categories[0]?.category.title ?? "Shop",
        categorySlug: row.categories[0]?.category.slug ?? "appliances",
        ratingAvg: row.ratingAvg, ratingCount: row.ratingCount
      };
    }
  } catch { /* fallback */ }
  p ??= fallbackProduct(params.slug) as never;
  if (!p) notFound();
  const eff = effectivePrice(p as never);
  const s = savings({ price: p.price, salePrice: p.salePrice, compareAtPrice: p.compareAtPrice });
  const related = (await allCards()).filter((x) => x.slug !== p!.slug).slice(0, 6);
  const inStock = p.stock > 0;
  return (
    <div className="container-es py-8">
      <nav className="text-xs text-charcoal-mute" aria-label="Breadcrumbs">
        <Link href="/" className="hover:underline">Home</Link> › <Link href={`/category/${p.categorySlug}`} className="hover:underline">{p.category}</Link> › <span className="text-charcoal">{p.title}</span>
      </nav>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="card overflow-hidden p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.title} className="aspect-square w-full rounded-2xl bg-mist object-contain p-6" />
          </div>
          {p.images && p.images.length > 1 && (
            <div className="mt-3 flex gap-2">{p.images.slice(0, 5).map((u) => (/* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt="" className="h-16 w-16 rounded-xl border object-contain" />))}</div>
          )}
        </div>
        <div>
          {p.brand && <div className="text-xs font-bold uppercase tracking-wide text-charcoal-mute">{p.brand}</div>}
          <h1 className="mt-1 text-3xl font-extrabold leading-tight">{p.title}</h1>
          <div className="mt-1 text-sm text-charcoal-mute">★ {p.ratingAvg.toFixed(1)} ({p.ratingCount} reviews) · SKU {p.sku}</div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold">{fmtAUD(eff)}</span>
            {s.was && <span className="text-lg text-charcoal-mute line-through">{fmtAUD(s.was)}</span>}
            {s.saved > 0 && <span className="badge-sale">SAVE {fmtAUD(s.saved)}</span>}
          </div>
          <p className="mt-1 text-xs text-charcoal-mute">GST-inclusive · or 4 interest-free payments of {fmtAUD(Math.round(eff / 4))}</p>
          {p.short && <p className="mt-3 text-[15px]">{p.short}</p>}
          <div className="mt-2 text-sm font-semibold">
            {inStock ? <span className="text-success">● In Stock — ready to ship</span> : <span className="text-danger">● Out of Stock</span>}
            {inStock && p.stock <= 5 && <span className="ml-2 text-danger">Only {p.stock} left!</span>}
          </div>
          <div className="card mt-4 flex items-center gap-2 p-4">
            <label htmlFor="postcode" className="text-sm font-semibold">Delivery estimate</label>
            <form action={`/product/${p.slug}`} method="get" className="flex gap-2">
              <input id="postcode" name="postcode" inputMode="numeric" pattern="\d{4}" placeholder="Postcode" className="input max-w-[140px]" aria-label="Delivery postcode" />
              <button className="btn-ghost !py-2">Check</button>
            </form>
            <span className="text-xs text-charcoal-mute">Standard 2–7 days · Express 1–3 · Free over $99*</span>
          </div>
          <BuyBox slug={p.slug} title={p.title} image={p.image} price={eff} inStock={inStock} />
          <ul className="mt-4 space-y-1 text-sm text-charcoal-mute">
            <li>✓ Local Australian warranty</li>
            <li>✓ 30-day change-of-mind returns on eligible items</li>
            <li>✓ Secure checkout — Stripe, PayPal, Apple Pay, Google Pay</li>
          </ul>
        </div>
      </div>
      <div className="card mt-8 p-6">
        <h2 className="text-xl font-extrabold">Product overview</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">{p.desc ?? p.short}</p>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-mist p-4"><h3 className="font-bold">Specifications</h3><p className="text-charcoal-mute">SKU {p.sku} · Brand {p.brand} · Category {p.category}</p></div>
          <div className="rounded-xl bg-mist p-4"><h3 className="font-bold">Shipping</h3><p className="text-charcoal-mute">Calculated at checkout by postcode. Bulky surcharges may apply.</p></div>
          <div className="rounded-xl bg-mist p-4"><h3 className="font-bold">Warranty & Returns</h3><p className="text-charcoal-mute">Manufacturer warranty + Australian Consumer Law. 30-day returns*.</p></div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-8" aria-label="Related products">
          <h2 className="mb-3 text-2xl font-extrabold">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{related.map((r) => (<ProductCard key={r.slug} p={r} />))}</div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Product", name: p.title, sku: p.sku, brand: p.brand,
          offers: { "@type": "Offer", priceCurrency: "AUD", price: (eff / 100).toFixed(2), availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: p.ratingAvg, reviewCount: p.ratingCount }
        })
      }} />
    </div>
  );
}
