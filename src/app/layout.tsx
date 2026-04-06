import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/LenisProvider";
import { GrainOverlay } from "@/components/GrainOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Перетяжка мебели в Москве — Бабаевская мастерская",
  description:
    "Перетяжка мягкой мебели, замена наполнителей и реставрация в Москве и МО. Мастера с опытом от 6 до 30 лет. Один мастер — одно изделие. Звоните: +7 977 977 39 39",
  keywords: [
    "перетяжка мебели",
    "перетяжка дивана",
    "реставрация мебели",
    "перетяжка мебели Москва",
    "замена обивки",
    "ремонт мебели",
  ],
  openGraph: {
    title: "Бабаевская мастерская — перетяжка мебели в Москве",
    description:
      "Мастера с опытом от 6 до 30 лет. Один мастер — одно изделие. Перетяжка, замена наполнителей, реставрация.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <LenisProvider>
          {children}
          <GrainOverlay />
        </LenisProvider>
      </body>
    </html>
  );
}
