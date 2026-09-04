import Link from "next/link";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES, BRANDS } from "@/data/catalog";
import { photosFor, HERO_PHOTOS } from "@/data/photos";
import { effectivePrice } from "@/lib/pricing";

type P = { slug: string; title: string; brand?: string | null; price: number; salePrice?: number | null; compareAtPrice?: number | null; ratingAvg?: number; ratingCount?: number; image?: string; bestSeller?: boolean; isNew?: boolean; clearance?: boolean; stock?: number };

async function getHome(): Promise<{ deals: P[]; kitchen: P[]; smart: P[]; tv: P[]; computing: P[]; mobile: P[]; major: P[]; fresh: P[] }> {
  try {
    const rows = await prisma.product.findMany({ where: { status: "active", deletedAt: null }, include: { images: { take: 1 }, brand: true, categories: { include: { category: { include: { parent: true } } } } }, take: 200 });
    const map = (r: (typeof rows)[number]): P => ({
      slug: r.slug, title: r.title, brand: r.brand?.name, price: r.price,
      salePrice: r.salePrice, compareAtPrice: r.compareAtPrice,
      ratingAvg: r.ratingAvg, ratingCount: r.ratingCount,
      image: r.images[0]?.url, bestSeller: r.bestSeller, isNew: r.isNew, clearance: r.clearance, stock: r.stock
    });
    const all = rows.map(map);
    const inCat = (slug: string) => rows.filter((r) => r.categories.some((c) => c.category.slug === slug || c.category.parent?.slug === slug)).map(map);
    return {
      deals: all.filter((_, i) => { const r = rows[i]; const s = r.salePrice ?? 0; return r.compareAtPrice != null || (s > 0 && s < r.price); }).slice(0, 12),
      kitchen: inCat("kitchen").slice(0, 12),
      smart: inCat("smart-home").slice(0, 12),
      tv: inCat("tv-audio").slice(0, 12),
      computing: inCat("computers").slice(0, 12),
      mobile: inCat("phones").slice(0, 12),
      major: inCat("appliances").slice(0, 12),
      fresh: all.filter((_, i) => rows[i].isNew).concat(all.slice(0, 12)).slice(0, 12)
    };
  } catch {
    const img = (_slug: string, cat: string) => photosFor(cat)[0];
    const brandName = (s: string) => BRANDS.find((b) => b.slug === s)?.name ?? s;
    const base: P[] = PRODUCTS.map((p) => ({ slug: p.slug, title: p.title, brand: brandName(p.brand), price: p.price, salePrice: p.sale ?? null, compareAtPrice: p.compareAt, ratingAvg: 4.5, ratingCount: 87, image: img(p.slug, p.category), bestSeller: p.best, isNew: p.isNew, clearance: p.clearance, stock: p.stock }));
    const byCat = (c: string) => base.filter((_, i) => PRODUCTS[i].category === c || PRODUCTS[i].category.startsWith(c));
    const sale = base.filter((_, i) => (PRODUCTS[i].sale ?? 0) > 0 || (PRODUCTS[i].compareAt ?? 0) > 0);
    return {
      deals: sale.slice(0, 12), kitchen: base.filter((_, i) => ["air-fryers", "coffee-machines", "microwaves", "kettles-toasters", "blenders-juicers", "cookware"].includes(PRODUCTS[i].category)).slice(0, 12),
      smart: byCat("smart").concat(base.filter((_, i) => PRODUCTS[i].category === "smart-home")).slice(0, 12),
      tv: base.filter((_, i) => ["smart-tvs", "soundbars-speakers"].includes(PRODUCTS[i].category)).slice(0, 12),
      computing: base.filter((_, i) => ["laptops", "monitors"].includes(PRODUCTS[i].category)).slice(0, 12),
      mobile: base.filter((_, i) => ["smartphones", "audio-wearables"].includes(PRODUCTS[i].category)).slice(0, 12),
      major: base.filter((_, i) => ["refrigerators", "washing-machines", "clothes-dryers", "dishwashers"].includes(PRODUCTS[i].category)).slice(0, 12),
      fresh: base.filter((_, i) => PRODUCTS[i].isNew).concat(base.slice(0, 8)).slice(0, 12)
    };
  }
}

async function getHero() {
  const fallback = {
    badge: "Weekend Tech Sale",
    headlineA: "Upgrade Your", headlineB: "Everyday",
    body: "Smart technology, powerful appliances and everyday essentials at great prices.",
    cta: "Shop Hot Deals", url: "/search?q=sale",
    cta2: "Explore Kitchen", url2: "/category/kitchen",
    image1: HERO_PHOTOS.livingRoom, image2: HERO_PHOTOS.kitchen
  };
  try {
    const row = await prisma.homepageSection.findFirst({ where: { kind: "hero", enabled: true } });
    if (!row) return fallback;
    const c = JSON.parse(row.config) as Record<string, string>;
    const words = (c.headline ?? `${fallback.headlineA} ${fallback.headlineB}`).split(" ");
    const split = Math.ceil(words.length / 2);
    return {
      badge: c.badge || fallback.badge,
      headlineA: words.slice(0, split).join(" "), headlineB: words.slice(split).join(" "),
      body: c.body || fallback.body,
      cta: c.cta || fallback.cta, url: c.url || fallback.url,
      cta2: c.cta2 || fallback.cta2, url2: c.url2 || fallback.url2,
      image1: c.image1 || fallback.image1, image2: c.image2 || fallback.image2
    };
  } catch { return fallback; }
}

function Rail({ title, sub, items, href }: { title: string; sub?: string; items: P[]; href: string }) {  if (!items.length) return null;
  return (
    <section className="container-es py-8" aria-label={title}>
      <div className="mb-4 flex items-end justify-between">
        <div><h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>{sub && <p className="text-sm text-charcoal-mute">{sub}</p>}</div>
        <Link href={href} className="text-sm font-bold underline">Shop all</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.slice(0, 12).map((p) => (<ProductCard key={p.slug} p={p} />))}
      </div>
    </section>
  );
}

export default async function Home() {
  const d = await getHome();
  const hero = await getHero();
  const featCats = CATEGORIES.filter((c) => !c.parent).slice(0, 8);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal text-white" aria-label="Featured campaign">
        <div className="container-es grid items-center gap-6 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="chip !bg-volt !text-charcoal">{hero.badge}</span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">{hero.headlineA} <span className="text-volt">{hero.headlineB}</span></h1>
            <p className="mt-3 max-w-md text-white/75">{hero.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={hero.url} className="btn-volt">{hero.cta}</Link>
              <Link href={hero.url2} className="rounded-xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/10">{hero.cta2}</Link>
            </div>
            <div className="mt-6 flex gap-4 text-xs text-white/70">
              <span>✓ Free shipping over $99*</span><span>✓ Local warranty</span><span>✓ 30-day returns*</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.image1} alt="Featured Electrostore range" className="rounded-2xl object-cover aspect-[4/3]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.image2} alt="Featured Electrostore range" className="mt-6 rounded-2xl object-cover aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b bg-mist" aria-label="Why shop with Electrostore">
        <div className="container-es grid grid-cols-2 gap-3 py-5 text-sm font-semibold lg:grid-cols-4">
          {[["🚚", "Fast AU delivery", "Metro + regional"], ["🛡️", "Local warranty", "AU consumer law"], ["↩️", "30-day returns*", "Eligible items"], ["🔒", "Secure checkout", "Stripe · PayPal · wallets"]].map(([i, t, s]) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl bg-white p-3"><span className="text-2xl" aria-hidden>{i}</span><span>{t}<br /><span className="text-xs font-normal text-charcoal-mute">{s}</span></span></div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-es py-8" aria-label="Shop by category">
        <h2 className="mb-4 text-2xl font-extrabold">Shop by category</h2>
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
          {featCats.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group rounded-2xl border bg-white p-3 text-center shadow-card hover:shadow-pop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photosFor(c.slug)[0]} alt="" loading="lazy" className="mx-auto aspect-square w-full max-w-[96px] rounded-xl object-cover" />
              <div className="mt-2 text-xs font-bold leading-tight">{c.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Today's Hot Deals" sub="Big savings across tech, kitchen and home." items={d.deals} href="/search?q=sale" />

      {/* PROMO TILES */}
      <section className="container-es grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Promotions">
        {[
          ["Kitchen Upgrade", "Air fryers, coffee machines & cookware.", "/category/kitchen", photosFor("air-fryers")[0]],
          ["Smart Home Sale", "Security, lighting & automation.", "/category/smart-home", photosFor("smart-home")[0]],
          ["Big Screen Weekend", "TVs, projectors & soundbars.", "/category/tv-audio", photosFor("smart-tvs")[0]],
          ["Work Anywhere", "Laptops, monitors & accessories.", "/category/computers", photosFor("laptops")[0]]
        ].map(([t, s, u, img]) => (
          <Link key={t} href={u} className="card group overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.03]" />
            <div className="p-4"><div className="font-extrabold">{t}</div><div className="text-sm text-charcoal-mute">{s}</div><span className="mt-2 inline-block text-sm font-bold underline">Shop now</span></div>
          </Link>
        ))}
      </section>

      <Rail title="Kitchen Essentials" items={d.kitchen} href="/category/kitchen" />
      <Rail title="Smarter Home" items={d.smart} href="/category/smart-home" />
      <Rail title="Big Screen Entertainment" items={d.tv} href="/category/tv-audio" />
      <Rail title="Computing Essentials" items={d.computing} href="/category/computers" />
      <Rail title="Mobile & Accessories" items={d.mobile} href="/category/phones" />
      <Rail title="Major Appliances" items={d.major} href="/category/appliances" />
      <Rail title="New Arrivals" items={d.fresh} href="/search?q=new" />

      {/* BRANDS */}
      <section className="container-es py-8" aria-label="Top brands">
        <h2 className="mb-4 text-2xl font-extrabold">Top brands</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {BRANDS.slice(0, 16).map((b) => (
            <Link key={b.slug} href={`/brand/${b.slug}`} className="rounded-2xl border bg-white p-4 text-center text-sm font-bold shadow-card hover:shadow-pop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/brands/${b.slug}.svg`} alt={`${b.name} logo`} loading="lazy" className="mx-auto h-10 object-contain" />
              <div className="mt-2">{b.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-es pb-4" aria-label="Newsletter">
        <form action="/api/newsletter" method="post" className="card flex flex-col items-start gap-3 bg-charcoal !text-white p-6 md:flex-row md:items-center" style={{ background: "var(--es-header,#151515)" }}>
          <div className="flex-1"><h2 className="text-xl font-extrabold">Get $10 off your first order over $99</h2><p className="text-sm text-white/70">Join for deals, new arrivals and price drops. No spam.</p></div>
          <input name="email" type="email" required placeholder="Email address" aria-label="Email address" className="input max-w-xs !text-charcoal" />
          <button className="btn-volt" formAction="/api/newsletter">Sign up</button>
        </form>
      </section>
    </>
  );
}
void effectivePrice;
