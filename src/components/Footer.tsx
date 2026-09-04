import Link from "next/link";
import { ElectroLogo } from "./Logo";

export function Footer({ socials, logoUrl, storeName, tagline }: { socials?: { label: string; url: string }[]; logoUrl?: string; storeName?: string; tagline?: string }) {
  const cols: { h: string; links: { label: string; url: string }[] }[] = [
    { h: "Shop", links: [{ label: "Appliances", url: "/category/appliances" }, { label: "Kitchen", url: "/category/kitchen" }, { label: "TVs", url: "/category/tv-audio" }, { label: "Computers", url: "/category/computers" }, { label: "Phones", url: "/category/phones" }, { label: "Gaming", url: "/category/gaming" }] },
    { h: "Customer Service", links: [{ label: "Contact", url: "/contact" }, { label: "Delivery", url: "/page/shipping" }, { label: "Returns", url: "/page/returns" }, { label: "Warranty", url: "/page/warranty" }, { label: "FAQs", url: "/page/faq" }, { label: "Order Tracking", url: "/account/orders" }] },
    { h: "About Electrostore", links: [{ label: "About", url: "/page/about" }, { label: "Terms", url: "/page/terms" }, { label: "Privacy", url: "/page/privacy" }, { label: "Help Centre", url: "/help" }] },
    { h: "My Account", links: [{ label: "Sign In", url: "/login" }, { label: "Orders", url: "/account/orders" }, { label: "Wishlist", url: "/account/wishlist" }, { label: "Returns", url: "/account/returns" }] }
  ];
  return (
    <footer className="mt-12 text-white" style={{ background: "var(--es-footer, #151515)" }}>
      <div className="container-es grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName ?? "Electrostore"} className="h-9 max-w-[200px] object-contain" />
          ) : (<ElectroLogo variant="light" />)}
          <p className="mt-3 text-sm text-white/70">Technology • Appliances • Home • Everyday.<br />{tagline ?? "Powering Your Everyday."}</p>
          <p className="mt-3 text-sm text-white/70">1300 000 000<br />support@electrostore.com.au</p>
          <div className="mt-3 flex gap-2 text-xs">
            {(socials?.length ? socials : [{ label: "Facebook", url: "#" }, { label: "Instagram", url: "#" }, { label: "YouTube", url: "#" }, { label: "TikTok", url: "#" }]).map((s) => (
              <a key={s.label} href={s.url} className="rounded-lg bg-white/10 px-2.5 py-1.5 font-semibold hover:bg-white/20">{s.label}</a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-volt">{c.h}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              {c.links.map((l) => (<li key={l.label}><Link href={l.url} className="hover:underline">{l.label}</Link></li>))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-es flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <span>© {new Date().getFullYear()} {storeName ?? "Electrostore"} Pty Ltd. All rights reserved. Prices include GST.</span>
          <span>VISA • Mastercard • AMEX • PayPal • Apple Pay • Google Pay • Afterpay</span>
        </div>
      </div>
    </footer>
  );
}
