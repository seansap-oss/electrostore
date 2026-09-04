import { redirect } from "next/navigation";
import { getSession, isStaffRole } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";
import { UrlWithUpload } from "@/components/admin/UrlWithUpload";
import { saveSettings } from "../actions";

export const metadata = { title: "Settings" };
const FONTS = ["Inter", "System UI", "Georgia", "Verdana", "Trebuchet MS"];

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
      <form action={saveSettings} className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card space-y-3 p-5"><h2 className="font-extrabold">Store name & announcements</h2>
            <div><label className="label" htmlFor="store_name">Store name</label><input id="store_name" name="store_name" defaultValue={settings.store_name} className="input" /></div>
            <div><label className="label" htmlFor="tagline">Tagline</label><input id="tagline" name="tagline" defaultValue={settings.tagline} className="input" /></div>
            <div><label className="label" htmlFor="announcement_message">Announcement bar fallback text</label><input id="announcement_message" name="announcement_message" defaultValue={settings.announcement_message} className="input" /></div>
            <div><label className="label" htmlFor="free_shipping_threshold">Free shipping threshold (cents)</label><input id="free_shipping_threshold" name="free_shipping_threshold" defaultValue={settings.free_shipping_threshold} className="input" /></div>
          </div>
          <div className="card space-y-3 p-5"><h2 className="font-extrabold">Logo Manager</h2>
            <UrlWithUpload name="logo_url" label="Main logo (URL or upload)" defaultValue={settings.logo_url} hint="PNG/SVG with transparent background works best. Shown in the header." />
            <UrlWithUpload name="logo_dark_url" label="Light-on-dark logo (footer)" defaultValue={settings.logo_dark_url} hint="Used on the dark footer. Falls back to the main logo." />
            <UrlWithUpload name="favicon_url" label="Favicon (browser tab icon)" defaultValue={settings.favicon_url} hint="Square PNG or SVG, e.g. your app icon." />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card space-y-3 p-5"><h2 className="font-extrabold">Theme — colours & font (live, no code)</h2>
            <div><label className="label" htmlFor="font_choice">Font</label>
              <select id="font_choice" name="font_choice" defaultValue={settings.font_choice ?? "Inter"} className="input">
                {FONTS.map((f) => (<option key={f} value={f}>{f}</option>))}
              </select></div>
            <div className="grid grid-cols-3 gap-3">
              {color("primary_color", "Primary")}{color("secondary_color", "Secondary")}{color("accent_color", "Accent")}
              {color("header_bg", "Header")}{color("footer_bg", "Footer")}{color("button_color", "Buttons")}
              {color("link_color", "Links")}{color("sale_badge_color", "Sale badge")}{color("announcement_bg", "Announcement")}
            </div>
            <button className="btn-volt w-full">Save settings</button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
