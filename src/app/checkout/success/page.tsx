import Link from "next/link";
export default function Success({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <div className="container-es py-16 text-center">
      <div className="card mx-auto max-w-lg p-10">
        <div className="text-5xl" aria-hidden>✅</div>
        <h1 className="mt-3 text-3xl font-extrabold">Thanks — order confirmed!</h1>
        <p className="mt-1 text-sm text-charcoal-mute">Order <strong>{searchParams.order ?? ""}</strong> · receipt sent to your email.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/account/orders" className="btn-dark">Track order</Link>
          <Link href="/" className="btn-volt">Keep shopping</Link>
        </div>
      </div>
    </div>
  );
}
