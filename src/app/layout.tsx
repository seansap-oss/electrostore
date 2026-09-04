import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toasts } from "@/components/Toasts";
import { getSettings, themeCss } from "@/lib/settings";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Electrostore — Smart Tech, Appliances & Home Essentials", template: "%s | Electrostore" },
  description: "Smart technology, powerful appliances and everyday essentials at great prices. Free shipping over $99 on eligible products.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
  openGraph: { type: "website", siteName: "Electrostore", title: "Electrostore", description: "Powering Your Everyday" },
  twitter: { card: "summary_large_image" }
};
export const viewport: Viewport = { themeColor: "#151515", width: "device-width", initialScale: 1, viewportFit: "cover" };

async function chrome() {
  try {
    const [ann, settings] = await Promise.all([
      prisma.navigationItem.findMany({ where: { menu: "announcement", enabled: true }, orderBy: { sortOrder: "asc" }, take: 5 }),
      getSettings()
    ]);
    return { ann: ann.map((a) => ({ label: a.label, url: a.url })), settings };
  } catch {
    return { ann: [{ label: "Free shipping on selected Electrostore products", url: "/search?q=shipping" }], settings: null as never };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { ann, settings } = await chrome();
  return (
    <html lang="en-AU">
      <head>{settings && <style dangerouslySetInnerHTML={{ __html: themeCss(settings) }} />}</head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-volt focus:p-2">Skip to content</a>
        <Header announcements={ann} />
        <main id="main" className="min-h-[60vh]">{children}</main>
        <Footer />
        <Toasts />
        <MobileNav />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}` }} />
      </body>
    </html>
  );
}

function MobileNav() {
  return (
    <nav aria-label="Mobile" className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden" style={{ display: "var(--es-mobilenav, flex)" }}>
      <div className="grid w-full grid-cols-5 text-[11px] font-semibold">
        {[["Home", "/"], ["Shop", "/category/appliances"], ["Search", "/search"], ["Wishlist", "/account/wishlist"], ["Account", "/account"]].map(([l, u]) => (
          <a key={l} href={u} className="flex flex-col items-center gap-0.5 py-2.5 hover:bg-mist"><span aria-hidden>{l === "Home" ? "⌂" : l === "Shop" ? "▦" : l === "Search" ? "⌕" : l === "Wishlist" ? "♡" : "◉"}</span>{l}</a>
        ))}
      </div>
    </nav>
  );
}
