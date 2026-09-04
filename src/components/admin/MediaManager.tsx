"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkMediaUsage, deleteMedia, addMediaByUrl, renameMedia } from "@/app/admin/actions";

type Item = { id: string; url: string; name: string };

export function MediaManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function addByUrl(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await addMediaByUrl(url, name);
      setUrl(""); setName("");
      router.refresh();
      window.dispatchEvent(new CustomEvent("es:toast", { detail: "Image added from URL" }));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Could not add URL."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <form onSubmit={addByUrl} className="card mb-3 flex flex-wrap items-end gap-2 p-4">
        <div className="min-w-[240px] flex-1"><label className="label" htmlFor="media-url">Add by URL link</label>
          <input id="media-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="input" /></div>
        <div className="w-56"><label className="label" htmlFor="media-name">Name (optional)</label>
          <input id="media-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hero banner" className="input" /></div>
        <button className="btn-dark !py-2.5" disabled={busy}>{busy ? "Checking…" : "Add URL"}</button>
        {err && <p className="w-full text-sm font-semibold text-danger" role="alert">{err}</p>}
      </form>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (<MediaCard key={m.id} item={m} />))}
      </div>
      {items.length === 0 && <p className="mt-3 text-sm text-charcoal-mute">Library is empty — upload a file or add by URL above.</p>}
    </div>
  );
}

function MediaCard({ item }: { item: Item }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [pending, setPending] = useState<null | { count: number; places: string[] }>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    setBusy(true); setErr(null);
    try {
      const usage = await checkMediaUsage(item.url);
      if (usage.count > 0) { setPending(usage); }
      else { await deleteMedia(item.id, false); router.refresh(); }
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed."); }
    finally { setBusy(false); }
  }
  async function onForceDelete() {
    setBusy(true);
    try { await deleteMedia(item.id, true); router.refresh(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed."); }
    finally { setBusy(false); }
  }
  async function onRename() {
    setBusy(true); setErr(null);
    try { await renameMedia(item.id, newName); setRenaming(false); router.refresh(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Rename failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="card overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.name} loading="lazy" className="aspect-square w-full bg-mist object-cover" />
      <div className="space-y-1.5 p-2.5">
        {renaming ? (
          <div className="flex gap-1">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input !py-1.5 text-xs" aria-label="Image name" />
            <button onClick={onRename} disabled={busy} className="rounded-lg bg-charcoal px-2 text-xs font-bold text-white">Save</button>
          </div>
        ) : (<div className="truncate text-xs font-bold" title={item.name}>{item.name}</div>)}
        {pending ? (
          <div className="rounded-xl bg-amber-50 p-2 text-xs" role="alert">
            <strong>⚠ Used in {pending.count} place{pending.count === 1 ? "" : "s"}:</strong>
            <ul className="list-disc pl-4">{pending.places.slice(0, 6).map((p) => (<li key={p}>{p}</li>))}</ul>
            <p className="mt-1">Deleting will leave those spots without this image.</p>
            <div className="mt-1.5 flex gap-1.5">
              <button onClick={onForceDelete} disabled={busy} className="rounded-lg bg-danger px-2 py-1 font-bold text-white">Delete anyway</button>
              <button onClick={() => setPending(null)} className="rounded-lg border px-2 py-1">Keep</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 text-xs">
            <button onClick={() => { navigator.clipboard?.writeText(item.url).catch(() => {}); window.dispatchEvent(new CustomEvent("es:toast", { detail: "URL copied" })); }} className="rounded-lg bg-mist px-2 py-1 font-semibold">Copy URL</button>
            <button onClick={() => setRenaming((r) => !r)} className="rounded-lg bg-mist px-2 py-1 font-semibold">Rename</button>
            <button onClick={onDelete} disabled={busy} className="rounded-lg bg-red-50 px-2 py-1 font-bold text-danger">Delete</button>
          </div>
        )}
        {err && <p className="text-xs font-semibold text-danger">{err}</p>}
      </div>
    </div>
  );
}
