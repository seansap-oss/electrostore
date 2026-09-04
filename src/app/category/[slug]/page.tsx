import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/data/catalog";
import { allCards } from "@/lib/catalog-server";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: params.slug.replace(/-/g, " ") };
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  const { slug } = params;
  let cat: { title: string; description: string | null; thumbnail?: string | null } | null = null;
  let childSlugs: string[] = [];
  let cards = await allCards();
  try {
    const c = await prisma.category.findUnique({ where: { slug }, include: { children: true } });
    if (c) {
      cat = { title: c.title, description: c.description, thumbnail: c.thumbnail };
      const fam = [c.slug, ...c.children.map((x) => x.slug)];
      childSlugs = c.children.map((x) => x.slug);
      const rows = await prisma.product.findMany({
        where: { status: "active", deletedAt: null, categories: { some: { category: { slug: { in: fam } } } } },
        include: { images: { take: 1 }, brand: true }, take: 120
      });
      if (rows.length) {
        cards = rows.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand?.name, price: r.price, salePrice: r.salePrice, compareAtPrice: r.compareAtPrice, ratingAvg: r.ratingAvg, ratingCount: r.ratingCount, image: r.images[0]?.url, bestSeller: r.bestSeller, isNew: r.isNew, clearance: r.clearance, stock: r.stock }));
      } else cards = [];
    }
  } catch { /* fallback below */ }
  if (!cat) {
    const f = CATEGORIES.find((c) => c.slug === slug);
    if (!f) notFound();
    cat = { title: f.title, description: f.description, thumbnail: `/images/cats/${f.slug}.svg` };
    const { PRODUCTS } = await import("@/data/catalog");
    const fam = [slug, ...CATEGORIES.filter((c) => c.parent === slug).map((c) => c.slug)];
    cards = cards.filter((_, i) => fam.includes(PRODUCTS[i]?.category ?? "") || fam.some((s) => (PRODUCTS[i]?.category ?? "").startsWith(s.split("-")[0])));
    if (!cards.length) cards = (await allCards()).slice(0, 12);
  }

  // URL-driven filters (?brand=&price_max=&sort=)
  const brand = searchParams.brand?.toLowerCase();
  const max = searchParams.price_max ? Number(searchParams.price_max) : null;
  const sort = searchParams.sort ?? "popular";
  let items = cards.filter((p) => (!brand || (p.brand ?? "").toLowerCase() === brand) && (!max || (p.salePrice ?? p.price) <= max));
  items = [...items].sort((a, b) => {
    if (sort === "price_asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
    if (sort === "price_desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
    if (sort === "rating") return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
    if (sort === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0;
  });

  return (
    <div className="container-es py-8">
      <nav className="text-xs text-charcoal-mute" aria-label="Breadcrumbs"><Link href="/" className="hover:underline">Home</Link> › {cat.title}</nav>
      <div className="card mt-3 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cat.thumbnail && <img src={cat.thumbnail} alt="" className="h-36 w-full object-cover" />}
        <div className="p-5">
          <h1 className="text-3xl font-extrabold">{cat.title}</h1>
          {cat.description && <p className="mt-1 max-w-2xl text-sm text-charcoal-mute">{cat.description}</p>}
          <p className="mt-1 text-xs text-charcoal-mute">{items.length} products</p>
        </div>
      </div>
      {childSlugs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {childSlugs.map((s) => (<Link key={s} href={`/category/${s}`} className="chip hover:bg-volt">{s.replace(/-/g, " ")}</Link>))}
        </div>
      )}
      <form method="get" className="mt-4 flex flex-wrap gap-2">
        <select name="sort" defaultValue={sort} className="input max-w-[220px]" aria-label="Sort products">
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
        <input name="price_max" defaultValue={searchParams.price_max ?? ""} placeholder="Max price (cents-free, e.g. 1500)" inputMode="numeric" className="input max-w-[220px]" aria-label="Maximum price in dollars" />
        <button className="btn-dark">Apply</button>
      </form>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((p) => (<ProductCard key={p.slug} p={p} />))}
      </div>
      {items.length === 0 && <div className="card mt-6 p-10 text-center"><h2 className="font-bold">Nothing matches those filters</h2><a className="btn-volt mt-3" href={`/category/${slug}`}>Clear filters</a></div>}
    </div>
  );
}
