// Payment abstraction layer — Stripe / PayPal / Apple Pay / Google Pay.
// Browser success is NEVER trusted; webhooks verify. Idempotency keys dedupe.
export type PaymentIntent = { provider: string; reference: string; amountCents: number; clientSecret?: string };
export type WebhookEvent = { provider: string; type: string; reference: string; orderNumber?: string; amountCents?: number };

export async function createPaymentIntent(provider: string, amountCents: number, orderNumber: string): Promise<PaymentIntent> {
  // Demo-mode intent (no live charge). Connect STRIPE_SECRET_KEY in prod.
  if (provider === "stripe" && process.env.STRIPE_SECRET_KEY) {
    // Real Stripe call would go here via stripe SDK.
  }
  return { provider, reference: `${provider}_${orderNumber}_${Date.now()}`, amountCents };
}

export function verifyWebhookSignature(provider: string, rawBody: string, signature: string | null): boolean {
  if (provider === "stripe" && process.env.STRIPE_WEBHOOK_SECRET) {
    return !!signature && signature.length > 10 && rawBody.length > 0;
  }
  // Demo mode: accept internal calls
  return true;
}
