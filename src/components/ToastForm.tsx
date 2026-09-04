"use client";
export function ToastForm({ toast, className, children }: { toast: string; className?: string; children: React.ReactNode }) {
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("es:toast", { detail: toast }));
      }}
    >
      {children}
    </form>
  );
}
