import type { ReactNode } from "react";

interface SectionEyebrowProps {
  children: ReactNode;
  /** Whether to render decorative hairline flanks. Default: true. */
  withLines?: boolean;
  /**
   * CSS custom property name for the hairline color (without var()).
   * Use "--color-accent" (default) or "--color-primary" to match sections
   * that previously used the warmer primary tone (Cases, Corporate, Payment,
   * PhotoRequest, About/наше производство).
   */
  lineColor?: "--color-accent" | "--color-primary";
  /** Line width (Tailwind width class like "w-12" or "w-10"). Default: "w-12". */
  lineWidth?: string;
  className?: string;
}

export function SectionEyebrow({
  children,
  withLines = true,
  lineColor = "--color-accent",
  lineWidth = "w-12",
  className = "",
}: SectionEyebrowProps) {
  const label = (
    <p
      className={`font-accent text-base italic text-[var(--text-accent)] md:text-lg lg:text-xl ${className}`}
    >
      {children}
    </p>
  );

  if (!withLines) return label;

  return (
    <div className="mx-auto mb-4 flex items-center justify-center gap-3">
      <div className={`h-px ${lineWidth}`} style={{ background: `var(${lineColor})` }} />
      {label}
      <div className={`h-px ${lineWidth}`} style={{ background: `var(${lineColor})` }} />
    </div>
  );
}
