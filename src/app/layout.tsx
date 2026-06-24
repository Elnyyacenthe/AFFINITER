import type { Metadata, Viewport } from "next";

import { SITE_NAME, SITE_URL } from "@/lib/utils";
import { AgeGate } from "@/components/layout/age-gate";
import { Providers } from "@/components/providers";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";

// Fonts servies en local depuis @fontsource-variable (plus de fetch Google Fonts au build/dev)
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ff3d8b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Annonces escorts vérifiées au Cameroun`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Plateforme N°1 d'annonces d'escorts et ndolo au Cameroun. Douala, Yaoundé, Bafoussam, Kribi… Profils vérifiés 18+, contact WhatsApp instantané, paiement Mobile Money.",
  keywords: [
    "escort cameroun",
    "ndolo",
    "annonce douala",
    "annonce yaoundé",
    "rencontre adulte cameroun",
    "escort bafoussam",
    "escort bamenda",
    "escort kribi",
    "escort limbé",
    "escort vérifiée",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  openGraph: {
    title: `${SITE_NAME} — Annonces escorts vérifiées au Cameroun`,
    description: "Plateforme N°1 d'annonces d'escorts au Cameroun (18+). Profils vérifiés, contact WhatsApp.",
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Annonces escorts au Cameroun`,
    description: "Plateforme N°1 d'annonces d'escorts au Cameroun (18+).",
  },
  other: {
    "rating": "adult",
    "RATING": "RTA-5042-1996-1400-1577-RTA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <OrganizationJsonLd />
        <Providers>
          <AgeGate />
          {children}
        </Providers>
      </body>
    </html>
  );
}
