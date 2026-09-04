"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ next }: { next?: string }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); setBusy(false); return; }
    if (j.role === "customer") { setErr("This account does not have admin access."); setBusy(false); return; }
    router.push(next || "/admin/dashboard"); router.refresh();
  }
  return (
    <div className="container-es max-w-md py-16">
      <div className="card p-8">
        <div className="text-sm font-bold uppercase tracking-wide text-charcoal-mute">Electrostore · Secure Admin</div>
        <h1 className="mt-1 text-3xl font-extrabold">Sign in</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {err && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">{err}</div>}
          <div><label className="label" htmlFor="email">Email or username</label><input id="email" type="email" required className="input" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" required className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn-dark w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
          <p className="text-sm"><a href="/forgot-password" className="underline">Forgot password?</a></p>
          <p className="text-xs text-charcoal-mute">Protected by rate limiting. Sessions are server-validated.</p>
        </form>
      </div>
    </div>
  );
}
