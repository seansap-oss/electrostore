import prisma from "@/lib/db";

export function normalize(q: string) {
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// Typo-tolerant token search over sqlite (LIKE-based) with brand/category/sku awareness.
// Production can swap this module for Meilisearch/Algolia without storefront changes.
export async function searchProducts(query: string, take = 24) {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean).slice(0, 6);
  const ors = tokens.flatMap((t) => [
    { title: { contains: t } },
    { slug: { contains: t } },
    { sku: { contains: t.toUpperCase() } },
    { description: { contains: t } }
  ]);
  const products = await prisma.product.findMany({
    where: { status: "active", deletedAt: null, OR: ors as never },
    include: { images: { take: 1 }, brand: true },
    take: take * 2
  });
  // Rank: title hits first, then brand, then sku
  const scored = products.map((p) => {
    const hay = `${p.title} ${p.sku} ${p.brand?.name ?? ""}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (p.title.toLowerCase().includes(t)) score += 3;
      else if (hay.includes(t)) score += 1;
    }
    return { p, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, take).map((s) => s.p);
}
