import prisma from "@/lib/db";
import { PRODUCTS, BRANDS, CATEGORIES } from "@/data/catalog";

export type CardP = {
  slug: string; title: string; brand?: string | null; price: number;
  salePrice?: number | null; compareAtPrice?: number | null;
  saleStart?: string | null; saleEnd?: string | null;
  ratingAvg?: number; ratingCount?: number; image?: string;
  bestSeller?: boolean; isNew?: boolean; clearance?: boolean; stock?: number; short?: string;
};

const bName = (s: string) => BRANDS.find((b) => b.slug === s)?.name ?? s;

export function fallbackCards(): CardP[] {
  return PRODUCTS.map((p) => ({
    slug: p.slug, title: p.title, brand: bName(p.brand), price: p.price,
    salePrice: p.sale ?? null, compareAtPrice: p.compareAt ?? null,
    ratingAvg: 4.5, ratingCount: 40 + (p.title.length % 120),
    image: `/images/cats/${p.category}.svg`,
    bestSeller: p.best, isNew: p.isNew, clearance: p.clearance, stock: p.stock, short: p.short
  }));
}

export async function allCards(): Promise<CardP[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "active", deletedAt: null },
      include: { images: { take: 1 }, brand: true }, take: 300
    });
    if (!rows.length) return fallbackCards();
    return rows.map((r) => ({
      slug: r.slug, title: r.title, brand: r.brand?.name, price: r.price,
      salePrice: r.salePrice, compareAtPrice: r.compareAtPrice,
      ratingAvg: r.ratingAvg, ratingCount: r.ratingCount,
      image: r.images[0]?.url, bestSeller: r.bestSeller, isNew: r.isNew,
      clearance: r.clearance, stock: r.stock, short: r.shortDescription ?? undefined
    }));
  } catch { return fallbackCards(); }
}

export function fallbackProduct(slug: string) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return null;
  const cat = CATEGORIES.find((c) => c.slug === p.category);
  return {
    slug: p.slug, title: p.title, sku: p.sku, brand: bName(p.brand), brandSlug: p.brand,
    price: p.price, salePrice: p.sale ?? null, compareAtPrice: p.compareAt ?? null,
    stock: p.stock, short: p.short, desc: p.desc,
    image: `/images/cats/${p.category}.svg`, category: cat?.title ?? "Shop",
    categorySlug: p.category, ratingAvg: 4.6, ratingCount: 132
  };
}

export async function categorySlugs(): Promise<string[]> {
  try {
    const rows = await prisma.category.findMany({ select: { slug: true } });
    if (rows.length) return rows.map((r) => r.slug);
  } catch { /* fallback */ }
  return CATEGORIES.map((c) => c.slug);
}
