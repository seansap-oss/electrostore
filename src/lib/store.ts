"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { slug: string; title: string; image: string; price: number; qty: number; variant?: string };
type CartState = {
  lines: CartLine[];
  coupon: string | null;
  add: (l: CartLine) => void;
  remove: (slug: string, variant?: string) => void;
  setQty: (slug: string, qty: number, variant?: string) => void;
  clear: () => void;
  setCoupon: (c: string | null) => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      add: (l) =>
        set((s) => {
          const i = s.lines.findIndex((x) => x.slug === l.slug && x.variant === l.variant);
          if (i >= 0) {
            const lines = [...s.lines];
            lines[i] = { ...lines[i], qty: lines[i].qty + l.qty };
            return { lines };
          }
          return { lines: [...s.lines, l] };
        }),
      remove: (slug, variant) => set((s) => ({ lines: s.lines.filter((x) => !(x.slug === slug && x.variant === variant)) })),
      setQty: (slug, qty, variant) =>
        set((s) => ({ lines: qty <= 0 ? s.lines.filter((x) => !(x.slug === slug && x.variant === variant)) : s.lines.map((x) => (x.slug === slug && x.variant === variant ? { ...x, qty } : x)) })),
      clear: () => set({ lines: [] }),
      setCoupon: (coupon) => set({ coupon }),
      count: () => get().lines.reduce((a, l) => a + l.qty, 0),
      subtotal: () => get().lines.reduce((a, l) => a + l.qty * l.price, 0)
    }),
    { name: "electrostore-cart" }
  )
);

type WishState = { slugs: string[]; toggle: (s: string) => void; has: (s: string) => boolean };
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug] })),
      has: (slug) => get().slugs.includes(slug)
    }),
    { name: "electrostore-wishlist" }
  )
);
