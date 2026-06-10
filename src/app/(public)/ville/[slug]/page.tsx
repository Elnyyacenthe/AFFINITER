import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdGrid } from "@/components/ads/ad-grid";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME, SITE_URL } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await prisma.city.findUnique({
    where: { slug },
    include: { _count: { select: { ads: { where: { status: "ACTIVE" } } } } },
  });
  if (!city) return { title: "Ville introuvable" };
  const adCount = city._count.ads;
  return {
    title: `Escorts à ${city.name} — ${adCount} annonces vérifiées`,
    description: `Découvrez ${adCount} escort${adCount > 1 ? "s" : ""} disponibles à ${city.name} (${city.region ?? "Cameroun"}). Profils 18+ vérifiés, contact WhatsApp instantané, paiement Mobile Money sécurisé. Discrétion garantie.`,
    keywords: [
      `escort ${city.name.toLowerCase()}`,
      `ndolo ${city.name.toLowerCase()}`,
      `annonce ${city.name.toLowerCase()}`,
      `rencontre ${city.name.toLowerCase()}`,
      `escort vérifiée ${city.name.toLowerCase()}`,
      `escort cameroun`,
    ],
    alternates: { canonical: `/ville/${city.slug}` },
    openGraph: {
      title: `Escorts à ${city.name} — ${adCount} annonces · ${SITE_NAME}`,
      description: `${adCount} escorts disponibles à ${city.name}. Profils vérifiés 18+.`,
      url: `${SITE_URL}/ville/${city.slug}`,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({ select: { slug: true } });
  return cities.map((c) => ({ slug: c.slug }));
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) notFound();

  const [vipAds, otherAds, totalAds] = await Promise.all([
    prisma.ad.findMany({
      where: { cityId: city.id, status: "ACTIVE", tier: { in: ["VIP", "PREMIUM"] } },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [
        { stickyUntil: { sort: "desc", nulls: "last" } },
        { tier: "desc" },
        { promotedUntil: "desc" },
        { lastBumpedAt: { sort: "desc", nulls: "last" } },
      ],
      take: 12,
    }),
    prisma.ad.findMany({
      where: { cityId: city.id, status: "ACTIVE", tier: "STANDARD" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [
        { stickyUntil: { sort: "desc", nulls: "last" } },
        { lastBumpedAt: { sort: "desc", nulls: "last" } },
        { publishedAt: "desc" },
      ],
      take: 40,
    }),
    prisma.ad.count({ where: { cityId: city.id, status: "ACTIVE" } }),
  ]);

  // JSON-LD : BreadcrumbList + ItemList
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Villes", item: `${SITE_URL}/villes` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${SITE_URL}/ville/${city.slug}` },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Escorts à ${city.name}`,
    numberOfItems: totalAds,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: [...vipAds, ...otherAds].slice(0, 20).map((ad, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/annonce/${ad.slug}`,
      name: ad.title,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      {/* Breadcrumb visible */}
      <nav className="container py-3 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">›</span>
        <Link href="/villes" className="hover:text-foreground">Villes</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{city.name}</span>
      </nav>

      {/* Hero */}
      <section className="border-b border-border/30 bg-gradient-to-br from-primary/20 via-background to-accent/10">
        <div className="container py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{city.region ?? "Cameroun"}</span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            Escorts à <span className="gradient-text">{city.name}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {city.description ??
              `Découvrez ${totalAds} annonce${totalAds > 1 ? "s" : ""} d'escorts à ${city.name}. Profils vérifiés, contact WhatsApp direct.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{totalAds} annonces actives</Badge>
            {city.region && <Badge variant="outline">Région {city.region}</Badge>}
          </div>
        </div>
      </section>

      {vipAds.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-4 font-display text-2xl font-bold">⭐ Sélection mise en avant</h2>
          <AdGrid ads={vipAds} priority={5} />
        </section>
      )}

      <section className="container py-10">
        <h2 className="mb-4 font-display text-2xl font-bold">Toutes les annonces</h2>
        <AdGrid ads={otherAds} />
      </section>

      {/* SEO-friendly bottom content : 200+ mots optimisés */}
      <section className="container py-10">
        <div className="rounded-xl border border-border/40 bg-card/30 p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 font-display text-xl font-bold text-foreground">
            Rencontres escorts à {city.name} en 2026
          </h2>
          <p>
            {city.name} est l'une des villes les plus actives du Cameroun pour les rencontres adultes.
            Sur <strong>{SITE_NAME}</strong>, vous trouverez {totalAds} annonce{totalAds > 1 ? "s" : ""} de profils
            d'escortes camerounaises et internationales, toutes <strong>vérifiées 18+</strong> via notre processus KYC strict.
          </p>
          <p className="mt-3">
            Chaque escorte présente à {city.name} propose des services variés : massage sensuel, accompagnement soirée,
            sortie restaurant, week-end VIP, déplacements hôtel ou domicile. Les tarifs s'étalent généralement entre
            5 000 et 25 000 FCFA de l'heure, avec des options nuit complète à partir de 60 000 FCFA. Tout paiement
            se fait en cash directement avec l'escorte (jamais à l'avance).
          </p>
          <p className="mt-3">
            <strong>{SITE_NAME}</strong> protège votre identité : le numéro WhatsApp de chaque annonce est masqué.
            Pour le révéler, débloquez-le pour 1 000 FCFA via Mobile Money (MTN ou Orange) ou souscrivez au
            <strong> Pass Premium</strong> à 1 000 FCFA / mois pour des révélations illimitées.
          </p>
          <p className="mt-3">
            ⚠️ <strong>Sécurité</strong> : ne payez jamais d'avance avant de rencontrer la personne. Signalez tout
            comportement suspect via le bouton "Signaler" sur chaque annonce. Notre équipe modère les profils sous 24h.
          </p>
        </div>
      </section>
    </div>
  );
}
