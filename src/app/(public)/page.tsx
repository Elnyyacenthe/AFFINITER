import Link from "next/link";
import { Search, Sparkles, ShieldCheck, Crown, MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdGrid } from "@/components/ads/ad-grid";
import { CityCard } from "@/components/ads/city-card";

export const revalidate = 300; // 5 min ISR

export default async function HomePage() {
  const [vipAds, recentAds, cities] = await Promise.all([
    prisma.ad.findMany({
      where: { status: "ACTIVE", tier: "VIP" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [{ promotedUntil: "desc" }, { publishedAt: "desc" }],
      take: 10,
    }),
    prisma.ad.findMany({
      where: { status: "ACTIVE" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [{ tier: "desc" }, { publishedAt: "desc" }],
      take: 20,
    }),
    prisma.city.findMany({
      where: { isPopular: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { ads: { where: { status: "ACTIVE" } } } },
      },
    }),
  ]);

  return (
    <>
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              La référence escort au Cameroun
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
              Rencontres <span className="gradient-text">sexy</span> à<br />
              Douala, Yaoundé & partout au Cameroun
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Des milliers d'annonces vérifiées, des escorts authentiques, contact direct WhatsApp.
              Discrétion garantie 24h/24.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/recherche">
                  <Search /> Explorer les annonces
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/poster-une-annonce">Poster mon annonce</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Profils vérifiés
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-400" /> Annonces VIP
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-pink-400" /> 15+ villes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= VIP ======================= */}
      {vipAds.length > 0 && (
        <section className="container py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">
                <Crown className="mr-2 inline h-7 w-7 text-amber-400" />
                Annonces <span className="gradient-text">VIP</span>
              </h2>
              <p className="text-sm text-muted-foreground">Sélection premium mise en avant</p>
            </div>
          </div>
          <AdGrid ads={vipAds} priority={5} />
        </section>
      )}

      {/* ======================= VILLES ======================= */}
      <section className="container py-12">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold">
            Explorer par <span className="gradient-text">ville</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Trouvez l'escort parfaite près de chez vous
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cities.map((city, idx) => (
            <CityCard
              key={city.id}
              index={idx}
              city={{
                name: city.name,
                slug: city.slug,
                imageUrl: city.imageUrl,
                adCount: city._count.ads,
              }}
            />
          ))}
        </div>
      </section>

      {/* ======================= RÉCENTES ======================= */}
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Annonces récentes</h2>
            <p className="text-sm text-muted-foreground">Dernières publications validées</p>
          </div>
          <Button asChild variant="link">
            <Link href="/recherche">Tout voir →</Link>
          </Button>
        </div>
        <AdGrid ads={recentAds} />
      </section>

      {/* ======================= CTA ESCORT ======================= */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent/10 p-8 md:p-16 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Vous êtes escort ? <span className="gradient-text">Augmentez vos revenus</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Publiez gratuitement votre annonce, atteignez des milliers de clients sérieux, et boostez votre visibilité avec nos options Premium et VIP.
          </p>
          <Button asChild size="xl" className="mt-8">
            <Link href="/inscription?role=ESCORT">Créer mon compte gratuit</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
