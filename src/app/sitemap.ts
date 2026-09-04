import { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/catalog";
import { PRODUCTS } from "@/data/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://electrostore.com.au";
  return [
    { url: base, lastModified: new Date() },
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: new Date() })),
    ...PRODUCTS.slice(0, 100).map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date() }))
  ];
}
