"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProductImage, deleteProductImage, updateProductImageAlt } from "@/app/admin/actions";

type Img = { id: string; url: string; alt: string | null };

export function ProductImageManager({ productId, images }: { productId: string; images: Img[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function refresh() { router.refresh(); }

  async function addUrl(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    try { await addProductImage(productId, url); setUrl(""); refresh(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Could not add image."); }
  }

  async function uploadFile(f: File) {
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Upload failed.");
      await addProductImage(productId, j.url);
      refresh();
      window.dispatchEvent(new CustomEvent("es:toast", { detail: "Photo uploaded" }));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  async function remove(id: string) {
    setErr(null);
    try { await deleteProductImage(id); setConfirmId(null); refresh(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed."); }
  }

  async function saveAlt(id: string, alt: string) {
    try { await updateProductImageAlt(id, alt); refresh(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Could not save alt text."); }
  }

  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-extrabold">Photos ({images.length})</h2>
      {err && <p className="rounded-xl bg-red-50 p-2 text-sm font-semibold text-danger" role="alert">{err}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((im, i) => (
          <div key={im.id} className="rounded-2xl border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt={im.alt ?? ""} className="aspect-square w-full rounded-xl bg-mist object-cover" />
            {i === 0 && <span className="chip mt-1 inline-block">Primary</span>}
            <AltRow initial={im.alt ?? ""} onSave={(v) => saveAlt(im.id, v)} />
            {confirmId === im.id ? (
              <div className="mt-1 rounded-xl bg-amber-50 p-2 text-xs" role="alert">
                <strong>Delete this photo?</strong>
                <div className="mt-1 flex gap-1.5">
                  <button onClick={() => remove(im.id)} className="rounded-lg bg-danger px-2 py-1 font-bold text-white">Yes, delete</button>
                  <button onClick={() => setConfirmId(null)} className="rounded-lg border px-2 py-1">Keep</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmId(im.id)} className="mt-1 text-xs font-bold text-danger underline">Delete</button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={addUrl} className="flex flex-wrap gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste image URL link…" className="input flex-1" aria-label="Image URL" />
        <button className="btn-ghost !py-2 text-sm">Add URL</button>
      </form>
      <label className="flex cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-sm font-semibold">
        <span className="rounded-lg bg-volt px-3 py-1.5">{uploading ? "Uploading…" : "Upload photo"}</span>
        <span className="text-charcoal-mute">JPG · PNG · WebP · AVIF (max 25MB)</span>
        <input type="file" accept="image/*" className="sr-only" disabled={uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

function AltRow({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="mt-1 flex gap-1">
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Alt text…" className="input !py-1.5 text-xs" aria-label="Alt text" />
      <button onClick={() => onSave(v)} className="rounded-lg bg-mist px-2 text-xs font-bold">Save</button>
    </div>
  );
}
