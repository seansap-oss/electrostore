"use client";
import { useEffect, useState } from "react";
export function Toasts() {
  const [msgs, setMsgs] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    const fn = (e: Event) => {
      const id = Date.now() + Math.random();
      setMsgs((m) => [...m, { id, text: (e as CustomEvent).detail ?? "Done" }]);
      setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 2600);
    };
    window.addEventListener("es:toast", fn);
    return () => window.removeEventListener("es:toast", fn);
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
      {msgs.map((m) => (<div key={m.id} className="rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-white shadow-pop">{m.text}</div>))}
    </div>
  );
}
