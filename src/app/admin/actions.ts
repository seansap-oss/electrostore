"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

async function staff() {
  const s = await getSession();
  if (!s || s.role === "customer") redirect("/admin?next=/admin/dashboard");
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
  const keys = ["store_name", "primary_color", "secondary_color", "accent_color", "page_bg", "header_bg", "footer_bg", "text_color", "button_color", "link_color", "sale_badge_color", "free_shipping_threshold", "announcement_bg"];
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
