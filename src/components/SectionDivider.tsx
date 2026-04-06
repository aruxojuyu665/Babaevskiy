"use client";

interface SectionDividerProps {
  variant?: "stitch" | "wave" | "ornament";
  className?: string;
}

export function SectionDivider({ variant = "ornament", className = "" }: SectionDividerProps) {
  if (variant === "stitch") {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <div className="stitch-divider w-32" />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`overflow-hidden ${className}`}>
        <svg viewBox="0 0 1440 60" fill="none" className="w-full text-[var(--bg-surface)]" preserveAspectRatio="none">
          <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z" fill="currentColor" />
        </svg>
      </div>
    );
  }

  // ornament — elegant diamond divider
  return (
    <div className={`flex items-center justify-center gap-4 py-8 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--color-accent)]/40" />
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rotate-45 bg-[var(--color-accent)]/30" />
        <div className="h-1.5 w-1.5 rotate-45 bg-[var(--color-primary)]" />
        <div className="h-1 w-1 rotate-45 bg-[var(--color-accent)]/30" />
      </div>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--color-accent)]/40" />
    </div>
  );
}
