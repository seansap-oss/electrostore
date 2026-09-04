import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/payments";

export async function POST(req: Request) {
  const raw = await req.text();
  const provider = new URL(req.url).searchParams.get("provider") ?? "stripe";
  const sig = req.headers.get("stripe-signature");
  if (!verifyWebhookSignature(provider, raw, sig)) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  try {
    const evt = JSON.parse(raw) as { type: string; reference?: string; orderNumber?: string };
    if (evt.orderNumber) {
      const status = evt.type.includes("refund") ? "Refunded" : evt.type.includes("fail") ? "Pending" : "Payment Confirmed";
      await prisma.order.updateMany({ where: { orderNumber: evt.orderNumber }, data: { status, paymentStatus: evt.type.includes("fail") ? "failed" : "paid" } }).catch(() => {});
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
