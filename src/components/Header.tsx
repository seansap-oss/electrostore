"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { ElectroLogo } from "./Logo";

const NAV = [
  { label: "Hot Deals", url: "/search?q=sale" },
  { label: "New Arrivals", url: "/search?q=new" },
  { label: "Appliances", url: "/category/appliances" },
  { label: "Kitchen", url: "/category/kitchen" },
  { label: "TV & Audio", url: "/category/tv-audio" },
  { label: "Computers", url: "/category/computers" },
  { label: "Phones", url: "/category/phones" },
  { label: "Gaming", url: "/category/gaming" },
  { label: "Smart Home", url: "/category/smart-home" },
  { label: "Brands", url: "/brands" },
  { label: "Clearance", url: "/search?q=clearance" }
];

export function Header({ announcements, logoUrl, storeName }: { announcements: { label: string; url: string }[]; logoUrl?: string; storeName?: string }) {
  const [q, setQ] = useState("");
  const [sugs, setSugs] = useState<{ slug: string; title: string; price: number; image?: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));

  useEffect(() => {
    if (q.trim().length < 2) { setSugs([]); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      if (r.ok) setSugs(await r.json());
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-charcoal text-white" style={{ background: "var(--es-header, #151515)" }}>
        <div className="container-es flex h-9 items-center justify-center gap-2 overflow-hidden text-xs font-semibold">
          <span className="truncate" role="marquee">⚡ {announcements[0]?.label ?? "Free shipping on selected Electrostore products"}</span>
        </div>
      </div>
      <div className="border-b bg-white">
        <div className="container-es flex h-16 items-center gap-3">
          <button className="rounded-lg p-2 lg:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}>☰</button>
          <Link href="/" aria-label={`${storeName ?? "Electrostore"} home`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName ?? "Electrostore"} className="h-9 max-w-[180px] object-contain" />
            ) : (<ElectroLogo />)}
          </Link>
          <form action="/search" method="get" className="relative mx-auto hidden w-full max-w-xl flex-1 md:block" role="search">
            <input name="q" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search Electrostore" aria-label="Search Electrostore" autoComplete="off"
              className="input !rounded-full !bg-mist pr-12" />
            <button className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-volt font-bold" aria-label="Search">⌕</button>
            {open && sugs.length > 0 && (
              <div className="absolute left-0 right-0 top-12 rounded-2xl border bg-white p-2 shadow-pop">
                {sugs.map((s) => (
                  <Link key={s.slug} href={`/product/${s.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-mist">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image ?? "/images/placeholder.svg"} alt="" className="h-10 w-10 rounded-lg bg-mist object-contain" />
                    <span className="flex-1 truncate text-sm font-medium">{s.title}</span>
                    <span className="text-sm font-bold">${(s.price / 100).toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
          </form>
          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold" aria-label="Account">
            <Link href="/account" className="hidden rounded-lg px-3 py-2 hover:bg-mist sm:block">Account</Link>
            <Link href="/account/wishlist" className="hidden rounded-lg px-3 py-2 hover:bg-mist sm:block">Wishlist</Link>
            <Link href="/cart" className="relative rounded-lg px-3 py-2 hover:bg-mist" aria-label={`Cart, ${count} items`}>
              🛒 Cart {count > 0 && <span className="absolute -right-0 -top-0 rounded-full bg-volt px-1.5 text-xs font-bold">{count}</span>}
            </Link>
          </nav>
        </div>
        <div className="container-es pb-2 md:hidden">
          <form action="/search" method="get" role="search"><input name="q" placeholder="Search Electrostore" aria-label="Search Electrostore" className="input !rounded-full !bg-mist" /></form>
        </div>
      </div>
      <nav className="hidden border-b bg-charcoal text-white lg:block" aria-label="Primary" style={{ background: "var(--es-header, #151515)" }}>
        <div className="container-es flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <Link key={n.label} href={n.url}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-white/10 ${n.label === "Hot Deals" || n.label === "Clearance" ? "text-volt" : ""}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={storeName ?? "Electrostore"} className="h-8 max-w-[160px] object-contain" />
              ) : (<ElectroLogo compact />)}
              <button aria-label="Close menu" className="rounded-lg p-2" onClick={() => setDrawer(false)}>✕</button>
            </div>
            {NAV.map((n) => (
              <Link key={n.label} href={n.url} onClick={() => setDrawer(false)} className="block rounded-xl px-3 py-3 font-semibold hover:bg-mist">{n.label}</Link>
            ))}
            <hr className="my-3" />
            <Link href="/account" onClick={() => setDrawer(false)} className="block rounded-xl px-3 py-3 hover:bg-mist">My Account</Link>
            <Link href="/account/orders" onClick={() => setDrawer(false)} className="block rounded-xl px-3 py-3 hover:bg-mist">Orders</Link>
            <Link href="/help" onClick={() => setDrawer(false)} className="block rounded-xl px-3 py-3 hover:bg-mist">Help Centre</Link>
          </div>
        </div>
      )}
    </header>
  );
}
