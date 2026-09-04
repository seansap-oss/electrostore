import Link from "next/link";
export const metadata = { title: "You're Offline" };
export default function Offline() {
  return (
    <div className="container-es py-16 text-center"><div className="card mx-auto max-w-md p-10">
      <div className="text-5xl">📡</div><h1 className="mt-2 text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="text-sm text-charcoal-mute">Check your connection — your cart is saved on this device.</p>
      <Link href="/" className="btn-volt mt-4">Try again</Link></div></div>
  );
}
