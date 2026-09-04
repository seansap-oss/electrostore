import { redirect } from "next/navigation";
import { getSession, isStaffRole } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";
import { saveSettings } from "../actions";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin({ searchParams }: { searchParams: { saved?: string } }) {
  const s = await getSession();
  if (!s || !isStaffRole(s.role)) redirect("/admin?next=/admin/settings");
  const settings = await getSettings().catch(() => ({} as Record<string, string>));
  const color = (k: string, label: string) => (
    <div><label className="label" htmlFor={k}>{label}</label><input id={k} name={k} type="color" defaultValue={settings[k] ?? "#FFD600"} className="h-11 w-full rounded-xl border" /></div>
  );
  return (
    <AdminShell title="Settings" crumbs="Admin › Settings">
      {searchParams.saved && <div className="card mb-3 border-green-200 bg-green-50 p-3 text-sm font-bold text-success">Saved — storefront updated without code changes.</div>}
      <form action={saveSettings} className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3 p-5"><h2 className="font-extrabold">Store</h2>
          <div><label className="label">Store name</label><input name="store_name" defaultValue={settings.store_name} className="input" /></div>
          <div><label className="label">Free shipping threshold (cents)</label><input name="free_shipping_threshold" defaultValue={settings.free_shipping_threshold} className="input" /></div>
        </div>
        <div className="card space-y-3 p-5"><h2 className="font-extrabold">Theme (live, no code)</h2>
          <div className="grid grid-cols-3 gap-3">
            {color("primary_color", "Primary")}{color("secondary_color", "Secondary")}{color("accent_color", "Accent")}
            {color("header_bg", "Header")}{color("footer_bg", "Footer")}{color("button_color", "Buttons")}
            {color("link_color", "Links")}{color("sale_badge_color", "Sale badge")}{color("announcement_bg", "Announcement")}
          </div>
          <button className="btn-volt w-full">Save settings</button>
        </div>
      </form>
      <div className="card mt-4 p-5 text-sm text-charcoal-mute">Commerce (GST, currency, order format) · Shipping methods · Payments (Stripe/PayPal keys via .env) · Email templates · SEO · Social links · PWA name/icon/splash — all centralised here.</div>
    </AdminShell>
  );
}
