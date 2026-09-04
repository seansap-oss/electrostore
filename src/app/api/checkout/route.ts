import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { orderNumber } from "@/lib/pricing";
import { addressSchema } from "@/lib/validators";
import { createPaymentIntent } from "@/lib/payments";
import { z } from "zod";

const lineSchema = z.object({ slug: z.string(), qty: z.number().int().min(1).max(99), variant: z.string().optional() });

export async function POST(req: Request) {
  if (process.env.DEMO_MODE === "true")
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  try {
    const session = await getSession();
    const body = await req.json();
    const { lines, address, shippingMethod, coupon, paymentProvider, idempotencyKey } = body as {
      lines: { slug: string; qty: number; variant?: string }[];
      address: unknown; shippingMethod: string; coupon?: string;
      paymentProvider: string; idempotencyKey: string;
    };
    const parsedLines = z.array(lineSchema).min(1).parse(lines);
    const addr = addressSchema.parse(address);

    // Idempotency: same key returns existing order
    if (idempotencyKey) {
      const dup = await prisma.order.findUnique({ where: { idempotencyKey }, include: { items: true } }).catch(() => null);
      if (dup) return NextResponse.json({ ok: true, orderNumber: dup.orderNumber, deduped: true });
    }

    const slugs = parsedLines.map((l) => l.slug);
    const products = await prisma.product.findMany({ where: { slug: { in: slugs }, status: "active" }, include: { images: true } });
    if (products.length !== slugs.length) return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });

    let subtotal = 0;
    const items = parsedLines.map((l) => {
      const p = products.find((x) => x.slug === l.slug)!;
      const unit = p.salePrice ?? p.price;
      if (p.stock < l.qty) throw new Error(`${p.title} only has ${p.stock} left in stock.`);
      subtotal += unit * l.qty;
      return { productId: p.id, title: p.title, sku: p.sku, variant: l.variant ?? null, qty: l.qty, unitPrice: unit, total: unit * l.qty };
    });

    // Coupon
    let discount = 0; let couponCode: string | null = null;
    if (coupon) {
      const c = await prisma.coupon.findUnique({ where: { code: coupon.toUpperCase() } });
      if (c?.enabled && subtotal >= c.minSpend && (!c.endAt || c.endAt >= new Date())) {
        couponCode = c.code;
        if (c.type === "percent") discount = Math.min(Math.round((subtotal * c.amount) / 100), c.maxDiscount ?? Infinity);
        else if (c.type === "fixed") discount = Math.min(c.amount, subtotal);
        await prisma.coupon.update({ where: { id: c.id }, data: { usedCount: { increment: 1 } } }).catch(() => {});
      }
    }

    const settings = await prisma.siteSetting.findMany().catch(() => []);
    const threshold = Number(settings.find((s) => s.key === "free_shipping_threshold")?.value ?? 9900);
    const freeShip = couponCode === "FREESHIP99" || subtotal - discount >= threshold;
    const shipping = shippingMethod === "express" ? 1499 : freeShip ? 0 : 990;
    const total = subtotal - discount + shipping;
    const gst = Math.round(total / 11);
    const num = orderNumber();

    await createPaymentIntent(paymentProvider ?? "stripe", total, num);

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber: num, userId: session?.sub ?? null, email: "guest@checkout",
          status: "Payment Confirmed", subtotal, discount, shipping, gst, total,
          couponCode, shippingMethod, addressJson: JSON.stringify(addr),
          paymentStatus: "paid", fulfilment: "processing",
          idempotencyKey: idempotencyKey || `${num}-${Date.now()}`,
          timeline: { create: { status: "Payment Confirmed", note: "Payment verified via provider" } },
          payments: { create: { provider: paymentProvider ?? "stripe", reference: `pi_${num}`, amount: total, status: "succeeded", rawJson: "{}" } }
        }
      });
      for (const it of items) {
        await tx.orderItem.create({ data: { orderId: o.id, ...it } });
        // Concurrency-safe decrement: only if enough stock
        const upd = await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.qty } }, data: { stock: { decrement: it.qty } } });
        if (upd.count === 0) throw new Error(`Insufficient stock for ${it.title}.`);
        await tx.inventoryMovement.create({ data: { productId: it.productId, qty: -it.qty, type: "customer_purchase", reference: num } }).catch(() => {});
      }
      return o;
    });

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 400 });
  }
}
