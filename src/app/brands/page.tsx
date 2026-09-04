import Link from "next/link";
import { BRANDS } from "@/data/catalog";
export const metadata = { title: "Shop by Brand" };
export default function BrandsPage() {
  return (
    <div className="container-es py-8">
      <h1 className="text-3xl font-extrabold">Shop by brand</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {BRANDS.map((b) => (
          <Link key={b.slug} href={`/brand/${b.slug}`} className="card p-5 text-center hover:shadow-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/brands/${b.slug}.svg`} alt={`${b.name} logo`} className="mx-auto h-12 object-contain" />
            <div className="mt-2 font-bold">{b.name}</div>
            <div className="text-xs text-charcoal-mute">{b.blurb}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
