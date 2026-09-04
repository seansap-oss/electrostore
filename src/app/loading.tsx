export default function Loading() {
  return (
    <div className="container-es grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-3"><div className="skeleton aspect-square" /><div className="skeleton mt-3 h-4 w-3/4" /><div className="skeleton mt-2 h-4 w-1/2" /></div>
      ))}
    </div>
  );
}
