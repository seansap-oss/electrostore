import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";
import { PRODUCTS, BRANDS } from "@/data/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const rows = await searchProducts(q, 8);
    return NextResponse.json(rows.map((p: { slug: string; title: string; price: number; salePrice: number | null; images: { url: string }[] }) => ({
      slug: p.slug, title: p.title, price: p.salePrice ?? p.price, image: p.images[0]?.url
    })));
  } catch {
    const t = q.toLowerCase();
    return NextResponse.json(PRODUCTS.filter((p) => (p.title + p.sku + p.brand).toLowerCase().includes(t)).slice(0, 8)
      .map((p) => ({ slug: p.slug, title: p.title, price: p.sale ?? p.price, image: `/images/cats/${p.category}.svg` })));
  }
}
void BRANDS;
