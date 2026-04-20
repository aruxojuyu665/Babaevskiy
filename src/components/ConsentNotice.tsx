import Link from "next/link";

interface ConsentNoticeProps {
  buttonLabel: string;
  className?: string;
}

export function ConsentNotice({ buttonLabel, className = "" }: ConsentNoticeProps) {
  return (
    <p
      className={`mt-3 text-center text-xs leading-relaxed text-[var(--text-muted)] ${className}`}
    >
      Нажимая «{buttonLabel}», я соглашаюсь с{" "}
      <Link
        href="/privacy"
        className="text-[var(--text-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
      >
        Политикой обработки персональных данных
      </Link>
      .
    </p>
  );
}
