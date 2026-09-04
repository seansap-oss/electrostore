"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-es py-16 text-center"><div className="card mx-auto max-w-md p-10">
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-sm text-charcoal-mute">Our team has been notified. Please try again.</p>
      <button className="btn-volt mt-4" onClick={() => reset()}>Try again</button></div></div>
  );
}
