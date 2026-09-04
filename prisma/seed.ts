import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, BRANDS, PRODUCTS } from "../src/data/catalog";

const prisma = new PrismaClient();

async function main() {
  // Roles
  const roles = [
    { key: "superadmin", name: "Super Admin", permissions: JSON.stringify(["*"]) },
    { key: "admin", name: "Administrator", permissions: JSON.stringify(["view", "create", "modify", "publish", "delete", "refund", "export"]) },
    { key: "catalogue", name: "Catalogue Manager", permissions: JSON.stringify(["view", "create", "modify", "publish"]) },
    { key: "inventory", name: "Inventory Manager", permissions: JSON.stringify(["view", "modify"]) },
    { key: "orders", name: "Order Manager", permissions: JSON.stringify(["view", "modify", "refund"]) },
    { key: "marketing", name: "Marketing Manager", permissions: JSON.stringify(["view", "create", "modify", "publish"]) },
    { key: "content", name: "Content Manager", permissions: JSON.stringify(["view", "create", "modify", "publish"]) },
    { key: "support", name: "Customer Support", permissions: JSON.stringify(["view", "modify"]) },
    { key: "reporting", name: "Reporting Viewer", permissions: JSON.stringify(["view", "export"]) }
  ];
  for (const r of roles) await prisma.role.upsert({ where: { key: r.key }, update: r, create: r });

  // Admin user
  const email = process.env.ADMIN_EMAIL ?? "admin@electrostore.com.au";
  const pw = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(pw, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "superadmin", status: "active" },
    create: { email, passwordHash: hash, firstName: "Store", lastName: "Owner", name: process.env.ADMIN_NAME ?? "Store Owner", role: "superadmin", emailVerified: new Date() }
  });
  const superRole = await prisma.role.findUnique({ where: { key: "superadmin" } });
  if (superRole) await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: superRole.id } }, update: {}, create: { userId: admin.id, roleId: superRole.id } });

  // Warehouses
  const whs = [
    { name: "Melbourne Distribution Centre", code: "MEL" },
    { name: "Sydney Distribution Centre", code: "SYD" },
    { name: "Brisbane Distribution Centre", code: "BNE" }
  ];
  for (const w of whs) await prisma.warehouse.upsert({ where: { code: w.code }, update: w, create: w });
  const mel = await prisma.warehouse.findUnique({ where: { code: "MEL" } });

  // Brands
  for (const b of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.blurb, logo: `/images/brands/${b.slug}.svg`, active: true },
      create: { name: b.name, slug: b.slug, description: b.blurb, logo: `/images/brands/${b.slug}.svg`, active: true }
    });
  }

  // Categories (parents first)
  const parents = CATEGORIES.filter((c) => !c.parent);
  const children = CATEGORIES.filter((c) => c.parent);
  for (const c of [...parents, ...children]) {
    const parent = c.parent ? await prisma.category.findUnique({ where: { slug: c.parent } }) : null;
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, description: c.description, thumbnail: `/images/cats/${c.slug}.svg`, heroImage: `/images/cats/${c.slug}.svg`, showOnHome: !!c.showOnHome, status: "active" },
      create: { title: c.title, slug: c.slug, description: c.description, thumbnail: `/images/cats/${c.slug}.svg`, heroImage: `/images/cats/${c.slug}.svg`, parentId: parent?.id ?? null, showOnHome: !!c.showOnHome, status: "active" }
    });
  }

  // Products
  let featured = 0;
  for (const p of PRODUCTS) {
    const brand = await prisma.brand.findUnique({ where: { slug: p.brand } });
    const cat = await prisma.category.findUnique({ where: { slug: p.category } });
    const data = {
      title: p.title, slug: p.slug, sku: p.sku,
      shortDescription: p.short, description: p.desc,
      brandId: brand?.id ?? null,
      price: p.price, compareAtPrice: p.compareAt ?? null,
      salePrice: p.sale ?? null,
      status: "active", featured: !!p.featured, bestSeller: !!p.best,
      isNew: !!p.isNew, clearance: !!p.clearance,
      stock: p.stock, lowStockAt: 5,
      ratingAvg: 4 + ((p.title.length % 10) / 10), ratingCount: 12 + (p.title.length % 180)
    };
    const prod = await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: data as never });
    if (cat) await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: prod.id, categoryId: cat.id } }, update: {}, create: { productId: prod.id, categoryId: cat.id } });
    const imgUrl = `/images/cats/${p.category}.svg`;
    const existing = await prisma.productImage.findFirst({ where: { productId: prod.id } });
    if (!existing) await prisma.productImage.create({ data: { productId: prod.id, url: imgUrl, alt: p.title, sortOrder: 0 } });
    if (mel) {
      await prisma.inventory.upsert({
        where: { productId_warehouseId: { productId: prod.id, warehouseId: mel.id } },
        update: { onHand: p.stock },
        create: { productId: prod.id, warehouseId: mel.id, onHand: p.stock }
      });
    }
    if (p.featured) featured++;
  }

  // Coupons / promos
  await prisma.coupon.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", description: "10% off your first order over $99", type: "percent", amount: 10, minSpend: 9900, enabled: true } });
  await prisma.coupon.upsert({ where: { code: "FREESHIP99" }, update: {}, create: { code: "FREESHIP99", description: "Free standard shipping over $99", type: "freeship", amount: 0, minSpend: 9900, enabled: true } });

  // Homepage sections
  const sections = [
    { kind: "hero", title: "Hero campaign", config: JSON.stringify({ headline: "Upgrade Your Everyday", body: "Smart technology, powerful appliances and everyday essentials at great prices.", cta: "Shop Hot Deals", url: "/search?q=deals", cta2: "Explore Kitchen", url2: "/category/kitchen" }), sortOrder: 0, enabled: true },
    { kind: "benefits", title: "Service benefits", config: "{}", sortOrder: 1, enabled: true },
    { kind: "categories", title: "Shop by category", config: "{}", sortOrder: 2, enabled: true },
    { kind: "deals", title: "Today's Hot Deals", config: JSON.stringify({ filter: "sale", limit: 12 }), sortOrder: 3, enabled: true },
    { kind: "tiles", title: "Campaign tiles", config: "{}", sortOrder: 4, enabled: true },
    { kind: "carousel", title: "Kitchen Essentials", config: JSON.stringify({ category: "kitchen", limit: 12 }), sortOrder: 5, enabled: true },
    { kind: "carousel", title: "Smarter Home", config: JSON.stringify({ category: "smart-home", limit: 12 }), sortOrder: 6, enabled: true },
    { kind: "carousel", title: "Big Screen Entertainment", config: JSON.stringify({ category: "tv-audio", limit: 12 }), sortOrder: 7, enabled: true },
    { kind: "brands", title: "Top brands", config: "{}", sortOrder: 8, enabled: true },
    { kind: "new", title: "New Arrivals", config: JSON.stringify({ filter: "new", limit: 12 }), sortOrder: 9, enabled: true },
    { kind: "newsletter", title: "Newsletter", config: "{}", sortOrder: 10, enabled: true }
  ];
  for (const s of sections) {
    const ex = await prisma.homepageSection.findFirst({ where: { kind: s.kind, title: s.title } });
    if (!ex) await prisma.homepageSection.create({ data: s });
  }

  // Navigation
  const navSeed: Array<{ menu: string; label: string; url: string; sortOrder: number }> = [
    { menu: "announcement", label: "Free shipping on selected Electrostore products", url: "/search?q=shipping", sortOrder: 0 },
    { menu: "announcement", label: "Weekend Tech Sale — Save on appliances & accessories", url: "/search?q=sale", sortOrder: 1 },
    { menu: "primary", label: "Hot Deals", url: "/search?q=sale", sortOrder: 0 },
    { menu: "primary", label: "New Arrivals", url: "/search?q=new", sortOrder: 1 },
    { menu: "primary", label: "Appliances", url: "/category/appliances", sortOrder: 2 },
    { menu: "primary", label: "Kitchen", url: "/category/kitchen", sortOrder: 3 },
    { menu: "primary", label: "TV & Audio", url: "/category/tv-audio", sortOrder: 4 },
    { menu: "primary", label: "Computers", url: "/category/computers", sortOrder: 5 },
    { menu: "primary", label: "Phones", url: "/category/phones", sortOrder: 6 },
    { menu: "primary", label: "Gaming", url: "/category/gaming", sortOrder: 7 },
    { menu: "primary", label: "Smart Home", url: "/category/smart-home", sortOrder: 8 },
    { menu: "primary", label: "Brands", url: "/brands", sortOrder: 9 },
    { menu: "primary", label: "Clearance", url: "/search?q=clearance", sortOrder: 10 }
  ];
  for (const n of navSeed) {
    const ex = await prisma.navigationItem.findFirst({ where: { menu: n.menu, label: n.label } });
    if (!ex) await prisma.navigationItem.create({ data: n });
  }

  // Pages
  const pages = [
    { slug: "about", title: "About Electrostore", body: "Electrostore is Australia's home for smart tech, appliances and everyday essentials — great prices, local warranty and fast delivery." },
    { slug: "shipping", title: "Delivery Information", body: "Standard 2–7 business days, express 1–3. Free standard delivery over $99 on eligible products. Bulky goods surcharges may apply by postcode." },
    { slug: "returns", title: "Returns & Refunds", body: "30-day change-of-mind returns on eligible items. Faults covered under Australian Consumer Law plus manufacturer warranty." },
    { slug: "warranty", title: "Warranty", body: "All products include manufacturer warranty plus your rights under Australian Consumer Law." },
    { slug: "privacy", title: "Privacy Policy", body: "We collect only what we need to fulfil orders and improve your experience. We never sell your data." },
    { slug: "terms", title: "Terms & Conditions", body: "Prices are GST-inclusive in AUD. Promotions subject to availability and scheduled dates." },
    { slug: "faq", title: "FAQs", body: "Track orders from your account. Contact support with your order number for the fastest help." },
    { slug: "contact-info", title: "Contact", body: "Support 7 days, 8am–8pm AEST. 1300 000 000 · support@electrostore.com.au" }
  ];
  for (const pg of pages) await prisma.sitePage.upsert({ where: { slug: pg.slug }, update: pg, create: pg });

  // Settings defaults
  const settings: Record<string, string> = {
    store_name: "Electrostore", tagline: "Powering Your Everyday",
    primary_color: "#FFD600", secondary_color: "#151515", accent_color: "#2456E6",
    page_bg: "#FFFFFF", soft_bg: "#F6F6F4", header_bg: "#151515", footer_bg: "#151515",
    text_color: "#151515", button_color: "#FFD600", link_color: "#2456E6",
    sale_badge_color: "#D92D20", font_choice: "Inter", border_radius: "12",
    announcement_bg: "#151515", announcement_text: "#FFFFFF",
    free_shipping_threshold: "9900", currency: "AUD", gst_rate: "10"
  };
  for (const [k, v] of Object.entries(settings)) await prisma.siteSetting.upsert({ where: { key: k }, update: { value: v }, create: { key: k, value: v } });

  console.log(`Seed complete: ${PRODUCTS.length} products, admin ${email}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
