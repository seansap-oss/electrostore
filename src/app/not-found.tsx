import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-es py-16 text-center"><div className="card mx-auto max-w-md p-10">
      <div className="text-6xl font-extrabold text-volt" style={{ WebkitTextStroke: "2px #151515" }}>404</div>
      <h1 className="mt-2 text-2xl font-extrabold">We can&apos;t find that page</h1>
      <p className="text-sm text-charcoal-mute">It may have moved — or try search.</p>
      <div className="mt-4 flex justify-center gap-2"><Link href="/" className="btn-volt">Homepage</Link><Link href="/search" className="btn-ghost">Search</Link></div></div></div>
  );
}
