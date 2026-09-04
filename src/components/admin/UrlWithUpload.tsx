"use client";
import { useState } from "react";

// Text field for an image URL with an adjacent file uploader:
// pick a file → uploads to the Media Library → fills the URL in.
export function UrlWithUpload({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue?: string; hint?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(f: File) {
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Upload failed.");
      setValue(j.url);
      window.dispatchEvent(new CustomEvent("es:toast", { detail: "Uploaded to Media Library" }));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="flex gap-2">
        <input id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://… or /uploads/…" className="input" />
        <label className="btn-ghost cursor-pointer !py-2 text-sm">
          {busy ? "…" : "Upload"}
          <input type="file" accept="image/*" className="sr-only" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        </label>
      </div>
      {hint && <p className="mt-1 text-xs text-charcoal-mute">{hint}</p>}
      {err && <p className="mt-1 text-xs font-semibold text-danger">{err}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={`${label} preview`} className="mt-2 h-12 rounded-lg border bg-mist object-contain px-2" />
      )}
    </div>
  );
}
