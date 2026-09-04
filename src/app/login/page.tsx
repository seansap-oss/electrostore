"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); setBusy(false); return; }
    router.push(j.role && j.role !== "customer" ? "/admin/dashboard" : "/account");
    router.refresh();
  }
  return (
    <div className="container-es max-w-md py-12">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="text-sm text-charcoal-mute">Sign in to track orders, wishlist and checkout faster.</p>
      <form onSubmit={submit} className="card mt-4 space-y-3 p-6">
        {err && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">{err}</div>}
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn-volt w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
        <div className="flex justify-between text-sm"><Link href="/forgot-password" className="underline">Forgot password?</Link><Link href="/signup" className="underline">Create account</Link></div>
      </form>
    </div>
  );
}
