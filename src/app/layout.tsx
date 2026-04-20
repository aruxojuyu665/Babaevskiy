import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/LenisProvider";
import { GrainOverlay } from "@/components/GrainOverlay";
import { PreloaderClient } from "@/components/PreloaderClient";
import { WarmCursor } from "@/components/WarmCursor";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  // LCP element ("Бабаевская мастерская") uses this font — keep preloaded.
  preload: true,
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a120b" },
  ],
  colorScheme: "light",
};

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Бабаевская мастерская",
  description:
    "Перетяжка мягкой мебели, замена наполнителей и реставрация в Москве и МО",
  telephone: "+7 977 977 39 39",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Иркутская 2к4",
    addressLocality: "Москва",
    addressCountry: "RU",
  },
  openingHours: "Mo-Sa 09:00-20:00",
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 55.831, longitude: 37.565 },
    geoRadius: "50000",
  },
  priceRange: "₽₽",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        {/* SSR-rendered solid cover — prevents Hero FOUC before the animated
            Preloader hydrates. Same bg as the Preloader; so visually identical
            during the 100–300 ms until React mounts. Removed by the inline
            script below (skip paths) or by Preloader itself (active path). */}
        <div
          id="static-preloader-cover"
          aria-hidden="true"
          className="fixed inset-0 z-[9999] bg-[var(--bg-primary)]"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=sessionStorage.getItem('babaevskaya:preloader-seen'),m=matchMedia;var skip=s||m('(prefers-reduced-motion: reduce)').matches||m('(pointer: coarse)').matches||m('(max-width: 768px)').matches||/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);if(skip){var e=document.getElementById('static-preloader-cover');if(e)e.style.display='none';}}catch(e){}`,
          }}
        />
        <LenisProvider>
          <PreloaderClient />
          <WarmCursor />
          {children}
          <GrainOverlay />
        </LenisProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontSize: "15px",
              padding: "12px 16px",
              borderRadius: "14px",
              boxShadow: "var(--shadow-warm)",
            },
            error: { iconTheme: { primary: "#C0392B", secondary: "white" } },
            success: {
              iconTheme: {
                primary: "var(--color-primary)",
                secondary: "white",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
