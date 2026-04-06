"use client";

import { OdometerCounter } from "@/components/OdometerCounter";

export function TrustBar() {
  return (
    <section className="relative border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:gap-8 md:py-14">
        <OdometerCounter value={30} suffix="+" label="лет опыта мастеров" />
        <OdometerCounter value={1000} suffix="+" label="перетянутых изделий" />
        <OdometerCounter value={1} suffix=" мастер" label="= 1 изделие" />
        <OdometerCounter value={2} suffix=" года" label="гарантия на работы" />
      </div>
    </section>
  );
}
