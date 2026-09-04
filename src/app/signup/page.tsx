"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", mobile: "", password: "", confirm: "" });
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const router = useRouter();
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); setBusy(false); return; }
    router.push("/account"); router.refresh();
  }
  return (
    <div className="container-es max-w-md py-12">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <form onSubmit={submit} className="card mt-4 space-y-3 p-6">
        {err && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">{err}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="fn">First name</label><input id="fn" required className="input" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div><label className="label" htmlFor="ln">Last name</label><input id="ln" required className="input" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
        </div>
        <div><label className="label" htmlFor="em">Email</label><input id="em" required type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><label className="label" htmlFor="mo">Mobile (optional)</label><input id="mo" className="input" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="pw">Password</label><input id="pw" required minLength={8} type="password" className="input" value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div><label className="label" htmlFor="cf">Confirm</label><input id="cf" required type="password" className="input" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} /></div>
        </div>
        <button className="btn-volt w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="text-sm text-center"><Link href="/login" className="underline">Already have an account? Sign in</Link></p>
      </form>
    </div>
  );
}
