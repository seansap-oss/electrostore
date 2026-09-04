"use client";
import { useWishlist } from "@/lib/store";
export function FavButton({ slug }: { slug: string }) {
  const { slugs, toggle } = useWishlist();
  const active = slugs.includes(slug);
  return (
    <button aria-label={active ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={active}
      onClick={() => { toggle(slug); window.dispatchEvent(new CustomEvent("es:toast", { detail: active ? "Removed from wishlist" : "Saved to wishlist" })); }}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card">
      <span aria-hidden className={active ? "text-red-600" : "text-charcoal"}>{active ? "♥" : "♡"}</span>
    </button>
  );
}
