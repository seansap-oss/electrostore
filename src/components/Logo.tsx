export function ElectroLogo({ variant = "dark", compact = false }: { variant?: "dark" | "light" | "mono"; compact?: boolean }) {
  const bolt = "#FFD600";
  const text = variant === "light" ? "#FFFFFF" : variant === "mono" ? "currentColor" : "#151515";
  return (
    <span className="inline-flex items-center gap-2" aria-label="Electrostore home">
      <svg width={compact ? 28 : 34} height={compact ? 28 : 34} viewBox="0 0 40 40" role="img" aria-hidden>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="#151515" />
        <path d="M22.5 6 11 22.5h7L17.5 34 29 17.5h-7L22.5 6Z" fill={bolt} />
      </svg>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight" style={{ color: text }}>
          Electro<span style={{ color: variant === "light" ? bolt : "#B89A00" }}>store</span>
        </span>
      )}
    </span>
  );
}
