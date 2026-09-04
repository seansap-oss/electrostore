import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { BRANDS } from "@/data/catalog";
import { allCards } from "@/lib/catalog-server";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = BRANDS.find((x) => x.slug === params.slug);
  return { title: b ? `${b.name} | Electrostore` : "Brand" };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const meta = BRANDS.find((x) => x.slug === params.slug);
  let name = meta?.name ?? params.slug;
  let blurb = meta?.blurb ?? "";
  let cards = (await allCards()).filter((p) => (p.brand ?? "").toLowerCase() === name.toLowerCase());
  try {
    const b = await prisma.brand.findUnique({ where: { slug: params.slug } });
    if (!b && !meta) notFound();
    if (b) { name = b.name; blurb = b.description ?? ""; }
    const rows = await prisma.product.findMany({ where: { status: "active", brand: { slug: params.slug } }, include: { images: { take: 1 }, brand: true }, take: 60 });
    if (rows.length) cards = rows.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand?.name, price: r.price, salePrice: r.salePrice, compareAtPrice: r.compareAtPrice, ratingAvg: r.ratingAvg, ratingCount: r.ratingCount, image: r.images[0]?.url }));
  } catch { if (!meta) notFound(); }
  return (
    <div className="container-es py-8">
      <nav className="text-xs text-charcoal-mute" aria-label="Breadcrumbs"><Link href="/" className="hover:underline">Home</Link> › <Link href="/brands" className="hover:underline">Brands</Link> › {name}</nav>
      <div className="card mt-3 flex items-center gap-4 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/brands/${params.slug}.svg`} alt={`${name} logo`} className="h-14 w-32 rounded-xl bg-mist object-contain p-2" />
        <div><h1 className="text-3xl font-extrabold">{name}</h1>{blurb && <p className="text-sm text-charcoal-mute">{blurb}</p>}</div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((p) => (<ProductCard key={p.slug} p={p} />))}
      </div>
      {cards.length === 0 && <div className="card mt-6 p-10 text-center">No products from {name} right now.</div>}
    </div>
  );
}
