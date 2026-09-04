export const fmtAUD = (cents: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format((cents ?? 0) / 100);

export function effectivePrice(p: { price: number; salePrice?: number | null; saleStart?: Date | string | null; saleEnd?: Date | string | null }) {
  const now = new Date();
  if (p.salePrice != null) {
    const s = p.saleStart ? new Date(p.saleStart) : null;
    const e = p.saleEnd ? new Date(p.saleEnd) : null;
    if ((!s || s <= now) && (!e || e >= now)) return p.salePrice;
  }
  return p.price;
}

export function savings(p: { price: number; salePrice?: number | null; compareAtPrice?: number | null; saleStart?: unknown; saleEnd?: unknown }) {
  const eff = effectivePrice(p as never);
  const was = p.compareAtPrice ?? (eff < p.price ? p.price : null);
  if (!was || was <= eff) return { was: null as number | null, saved: 0, pct: 0 };
  const saved = was - eff;
  return { was, saved, pct: Math.round((saved / was) * 100) };
}

// GST-inclusive: gst component = total / 11
export function gstComponent(totalCents: number) {
  return Math.round(totalCents / 11);
}

export function freeShipProgress(subtotalCents: number, thresholdCents: number) {
  return { remaining: Math.max(0, thresholdCents - subtotalCents), pct: Math.min(100, Math.round((subtotalCents / thresholdCents) * 100)) };
}

export function orderNumber(date = new Date()) {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `EL-${y}${m}${d}-${rand}`;
}
