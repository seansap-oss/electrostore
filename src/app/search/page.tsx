import prisma from "@/lib/db";
import { searchProducts } from "@/lib/search";
import { ProductCard } from "@/components/ProductCard";
import { allCards } from "@/lib/catalog-server";
import { PRODUCTS, BRANDS } from "@/data/catalog";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; brand?: string; sort?: string } }) {
  const q = (searchParams.q ?? "").trim();
  let items: Parameters<typeof ProductCard>[0]["p"][] = [];
  const all = await allCards();
  if (!q) {
    items = all.slice(0, 24);
  } else {
    try {
      const rows = await searchProducts(q, 48);
      items = rows.map((p: { slug: string; title: string; price: number; salePrice: number | null; brand?: { name: string } | null; images: { url: string }[] }) => ({
        slug: p.slug, title: p.title, brand: p.brand?.name, price: p.price, salePrice: p.salePrice,
        image: p.images[0]?.url, ratingAvg: 4.5, ratingCount: 50
      }));
      if (!items.length) throw new Error("fallback");
    } catch {
      const t = q.toLowerCase();
      items = all.filter((p) => {
        const i = PRODUCTS.find((x) => x.slug === p.slug);
        return (p.title + " " + (p.brand ?? "") + " " + (i?.sku ?? "") + " " + (i?.category ?? "")).toLowerCase().includes(t) ||
          t.split(" ").some((w) => w.length > 2 && (p.title + (p.brand ?? "")).toLowerCase().includes(w));
      });
    }
  }
  let filtered = searchParams.brand ? items.filter((p) => (p.brand ?? "").toLowerCase() === searchParams.brand!.toLowerCase()) : items;
  const sort = searchParams.sort ?? "relevance";
  filtered = [...filtered].sort((a, b) => {
    const pa = a.salePrice ?? a.price, pb = b.salePrice ?? b.price;
    if (sort === "price_asc") return pa - pb;
    if (sort === "price_desc") return pb - pa;
    if (sort === "rating") return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
    return 0;
  });
  return (
    <div className="container-es py-8">
      <nav className="text-xs text-charcoal-mute" aria-label="Breadcrumbs"><a href="/" className="hover:underline">Home</a> › Search</nav>
      <h1 className="mt-1 text-3xl font-extrabold">{q ? `Results for “${q}”` : "Search Electrostore"}</h1>
      <p className="text-sm text-charcoal-mute">{filtered.length} product{filtered.length === 1 ? "" : "s"}</p>
      <form method="get" className="mt-4 flex flex-wrap gap-2" action="/search">
        <input name="q" defaultValue={q} placeholder="Search products, brands, SKUs…" className="input max-w-sm" aria-label="Search query" />
        <select name="brand" defaultValue={searchParams.brand ?? ""} className="input max-w-[200px]" aria-label="Filter by brand">
          <option value="">All brands</option>
          {BRANDS.slice(0, 20).map((b) => (<option key={b.slug} value={b.name}>{b.name}</option>))}
        </select>
        <select name="sort" defaultValue={sort} className="input max-w-[220px]" aria-label="Sort">
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
        <button className="btn-dark">Apply</button>
      </form>
      {filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <h2 className="text-xl font-bold">No matches for “{q}”</h2>
          <p className="mt-1 text-sm text-charcoal-mute">Try checking your spelling, a brand name, model or SKU.</p>
          <a href="/" className="btn-volt mt-4">Back to homepage</a>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.slice(0, 48).map((p) => (<ProductCard key={p.slug} p={p} />))}
        </div>
      )}
    </div>
  );
}
void prisma;
