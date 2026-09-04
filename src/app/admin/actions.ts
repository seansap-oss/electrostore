"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

async function staff() {
  const s = await getSession();
  if (!s || s.role === "customer") redirect("/admin?next=/admin/dashboard");
  if (process.env.DEMO_MODE === "true")
    throw new Error("The live preview site is read-only — connect a production database to save changes.");
  return s;
}

export async function saveProduct(fd: FormData) {
  const s = await staff();
  const id = String(fd.get("id") ?? "");
  const data = {
    title: String(fd.get("title")), slug: String(fd.get("slug")).toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    sku: String(fd.get("sku")).toUpperCase(), price: Math.round(Number(fd.get("price")) * 100),
    compareAtPrice: fd.get("compareAt") ? Math.round(Number(fd.get("compareAt")) * 100) : null,
    salePrice: fd.get("sale") ? Math.round(Number(fd.get("sale")) * 100) : null,
    stock: Number(fd.get("stock") ?? 0), status: String(fd.get("status") ?? "draft"),
    shortDescription: String(fd.get("short") ?? ""), description: String(fd.get("desc") ?? ""),
    featured: fd.get("featured") === "on", bestSeller: fd.get("best") === "on",
    isNew: fd.get("isNew") === "on", clearance: fd.get("clearance") === "on"
  };
  const brandSlug = String(fd.get("brand") ?? "");
  const catSlug = String(fd.get("category") ?? "");
  const brand = brandSlug ? await prisma.brand.findUnique({ where: { slug: brandSlug } }) : null;
  const cat = catSlug ? await prisma.category.findUnique({ where: { slug: catSlug } }) : null;
  let recordId = id;
  if (id) {
    const before = await prisma.product.findUnique({ where: { id } });
    const rec = await prisma.product.update({ where: { id }, data: { ...data, brandId: brand?.id ?? undefined } });
    recordId = rec.id;
    await audit({ actorId: s.sub, action: "product.update", module: "products", recordId, before: { price: before?.price }, after: { price: rec.price } });
  } else {
    if (!data.title || !data.sku) throw new Error("Title and SKU are required.");
    const rec = await prisma.product.create({ data: { ...data, brandId: brand?.id, images: { create: { url: `/images/cats/${catSlug || "kitchen"}.svg`, alt: data.title } } } });
    recordId = rec.id;
    await audit({ actorId: s.sub, action: "product.create", module: "products", recordId });
  }
  if (cat && recordId) {
    await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: recordId, categoryId: cat.id } }, update: {}, create: { productId: recordId, categoryId: cat.id } }).catch(() => {});
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const s = await staff();
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: "archived" } });
  await audit({ actorId: s.sub, action: "product.archive", module: "products", recordId: id });
  revalidatePath("/admin/products");
}

export async function saveCategory(fd: FormData) {
  await staff();
  const id = String(fd.get("id") ?? "");
  const data = {
    title: String(fd.get("title")), slug: String(fd.get("slug")).toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    description: String(fd.get("description") ?? ""), showOnHome: fd.get("showOnHome") === "on",
    showInNav: fd.get("showInNav") !== "off", status: "active",
    thumbnail: `/images/cats/${String(fd.get("slug")).toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.svg`
  };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function saveCoupon(fd: FormData) {
  await staff();
  const code = String(fd.get("code")).toUpperCase();
  const data = { code, description: String(fd.get("description") ?? ""), type: String(fd.get("type") ?? "percent"), amount: Number(fd.get("amount") ?? 0), minSpend: Math.round(Number(fd.get("minSpend") ?? 0) * 100), enabled: fd.get("enabled") !== "off" };
  await prisma.coupon.upsert({ where: { code }, update: data, create: data });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function saveSettings(fd: FormData) {
  await staff();
  const keys = ["store_name", "tagline", "announcement_message", "primary_color", "secondary_color", "accent_color", "page_bg", "header_bg", "footer_bg", "text_color", "button_color", "link_color", "sale_badge_color", "font_choice", "logo_url", "logo_dark_url", "favicon_url", "free_shipping_threshold", "announcement_bg"];
  for (const k of keys) {
    const v = fd.get(k);
    if (v != null) await prisma.siteSetting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } });
  }
  revalidatePath("/");
  redirect("/admin/settings?saved=1");
}

export async function setOrderStatus(orderId: string, status: string) {
  const s = await staff();
  const before = await prisma.order.findUnique({ where: { id: orderId } });
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await prisma.orderTimeline.create({ data: { orderId, status, note: `Set by ${s.email}` } }).catch(() => {});
  await audit({ actorId: s.sub, action: "order.status", module: "orders", recordId: orderId, before: { status: before?.status }, after: { status } });
  revalidatePath("/admin/orders");
}

export async function moderateReview(id: string, status: string) {
  await staff();
  await prisma.review.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reviews");
}

export async function savePage(fd: FormData) {
  await staff();
  const slug = String(fd.get("slug")).toLowerCase();
  const data = { slug, title: String(fd.get("title")), body: String(fd.get("body") ?? ""), status: String(fd.get("status") ?? "published") };
  await prisma.sitePage.upsert({ where: { slug }, update: data, create: data });
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function adjustStock(productId: string, qty: number, note: string) {
  const s = await staff();
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { stock: { increment: qty } } });
    await tx.inventoryMovement.create({ data: { productId, qty, type: "manual_correction", note, actorId: s.sub } });
  });
  revalidatePath("/admin/inventory");
}

// ---------- Media ----------
export async function checkMediaUsage(url: string): Promise<{ count: number; places: string[] }> {
  await staff();
  const places: string[] = [];
  const prodImgs = await prisma.productImage.findMany({ where: { url }, include: { product: { select: { title: true } } }, take: 10 });
  for (const i of prodImgs) places.push(`Product: ${i.product.title}`);
  const cats = await prisma.category.findMany({ where: { OR: [{ thumbnail: url }, { heroImage: url }, { mobileHero: url }] }, take: 10 });
  for (const c of cats) places.push(`Category: ${c.title}`);
  const brands = await prisma.brand.findMany({ where: { OR: [{ logo: url }, { hero: url }] }, take: 10 });
  for (const b of brands) places.push(`Brand: ${b.name}`);
  const settings = await prisma.siteSetting.findMany({ where: { value: { contains: url } }, take: 10 });
  for (const st of settings) places.push(`Setting: ${st.key}`);
  const sections = await prisma.homepageSection.findMany({ where: { config: { contains: url } }, take: 10 });
  for (const sh of sections) places.push(`Homepage: ${sh.title ?? sh.kind}`);
  return { count: places.length, places };
}

export async function deleteMedia(id: string, force: boolean) {
  const s = await staff();
  const m = await prisma.media.findUnique({ where: { id } });
  if (!m) throw new Error("Media not found.");
  const usage = await checkMediaUsage(m.url);
  if (usage.count > 0 && !force)
    throw new Error(`In use in ${usage.count} place(s): ${usage.places.slice(0, 5).join("; ")}. Confirm deletion to proceed.`);
  await prisma.media.delete({ where: { id } });
  await audit({ actorId: s.sub, action: "media.delete", module: "media", recordId: id, before: { url: m.url } });
  revalidatePath("/admin/media");
}

export async function addMediaByUrl(url: string, name: string) {
  const s = await staff();
  const clean = url.trim();
  if (!/^https?:\/\/.+\..+/.test(clean)) throw new Error("Enter a valid http(s) image URL.");
  try {
    const res = await fetch(clean, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("unreachable");
  } catch {
    throw new Error("That URL could not be reached. Check the link and try again.");
  }
  await prisma.media.create({ data: { url: clean, name: name.trim() || clean.split("/").pop()?.slice(0, 80) || "Untitled", mime: "image/*", folder: "by-url" } });
  await audit({ actorId: s.sub, action: "media.create", module: "media", after: { url: clean } });
  revalidatePath("/admin/media");
}

export async function renameMedia(id: string, name: string) {
  await staff();
  if (!name.trim()) throw new Error("Name cannot be empty.");
  await prisma.media.update({ where: { id }, data: { name: name.trim().slice(0, 120) } });
  revalidatePath("/admin/media");
}

// ---------- Product images ----------
export async function addProductImage(productId: string, url: string) {
  await staff();
  const clean = url.trim();
  if (!/^https?:\/\/.+|^\/uploads\/.+|^\/images\/.+/.test(clean)) throw new Error("Enter a valid image URL or upload a file.");
  const max = await prisma.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "desc" } });
  const prod = await prisma.product.findUnique({ where: { id: productId } });
  await prisma.productImage.create({ data: { productId, url: clean, alt: prod?.title ?? "", sortOrder: (max?.sortOrder ?? -1) + 1 } });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/media");
}

export async function deleteProductImage(imageId: string) {
  await staff();
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img) throw new Error("Image not found.");
  const remaining = await prisma.productImage.count({ where: { productId: img.productId } });
  if (remaining <= 1) throw new Error("A product must keep at least one image — add a replacement first.");
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${img.productId}`);
}

export async function updateProductImageAlt(imageId: string, alt: string) {
  await staff();
  const img = await prisma.productImage.update({ where: { id: imageId }, data: { alt: alt.slice(0, 160) } });
  revalidatePath(`/admin/products/${img.productId}`);
}

// ---------- Hero ----------
export async function saveHero(fd: FormData) {
  await staff();
  const config = JSON.stringify({
    badge: String(fd.get("badge") ?? ""),
    headline: String(fd.get("headline") ?? ""),
    body: String(fd.get("body") ?? ""),
    cta: String(fd.get("cta") ?? ""),
    url: String(fd.get("url") ?? ""),
    cta2: String(fd.get("cta2") ?? ""),
    url2: String(fd.get("url2") ?? ""),
    image1: String(fd.get("image1") ?? ""),
    image2: String(fd.get("image2") ?? "")
  });
  const ex = await prisma.homepageSection.findFirst({ where: { kind: "hero" } });
  if (ex) await prisma.homepageSection.update({ where: { id: ex.id }, data: { config, enabled: true } });
  else await prisma.homepageSection.create({ data: { kind: "hero", title: "Hero campaign", config, sortOrder: 0, enabled: true } });
  revalidatePath("/");
  redirect("/admin/homepage/hero?saved=1");
}
