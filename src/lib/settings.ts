import prisma from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  store_name: "Electrostore",
  tagline: "Powering Your Everyday",
  primary_color: "#FFD600",
  secondary_color: "#151515",
  accent_color: "#2456E6",
  page_bg: "#FFFFFF",
  soft_bg: "#F6F6F4",
  header_bg: "#151515",
  footer_bg: "#151515",
  text_color: "#151515",
  button_color: "#FFD600",
  link_color: "#2456E6",
  sale_badge_color: "#D92D20",
  font_choice: "Inter",
  border_radius: "12",
  announcement_bg: "#151515",
  announcement_text: "#FFFFFF",
  free_shipping_threshold: "9900",
  currency: "AUD",
  gst_rate: "10",
  order_prefix: "EL-",
  pwa_name: "Electrostore",
  pwa_short: "Electrostore"
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

export function themeCss(s: Record<string, string>) {
  return `:root{--es-primary:${s.primary_color};--es-secondary:${s.secondary_color};--es-accent:${s.accent_color};--es-page:${s.page_bg};--es-soft:${s.soft_bg};--es-header:${s.header_bg};--es-footer:${s.footer_bg};--es-text:${s.text_color};--es-button:${s.button_color};--es-link:${s.link_color};--es-sale:${s.sale_badge_color};--es-radius:${s.border_radius}px;--es-font:${s.font_choice},system-ui,sans-serif}`;
}
