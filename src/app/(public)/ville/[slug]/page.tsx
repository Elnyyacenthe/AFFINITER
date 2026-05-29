import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdGrid } from "@/components/ads/ad-grid";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) return { title: "Ville introuvable" };
  return {
    title: `Escorts à ${city.name}`,
    description: `Trouvez les meilleures annonces d'escorts à ${city.name} (${city.region ?? "Cameroun"}) sur ${SITE_NAME}. Profils vérifiés, contact WhatsApp.`,
    alternates: { canonical: `/ville/${city.slug}` },
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
      orderBy: [{ tier: "desc" }, { promotedUntil: "desc" }],
      take: 12,
    }),
    prisma.ad.findMany({
      where: { cityId: city.id, status: "ACTIVE", tier: "STANDARD" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 40,
    }),
    prisma.ad.count({ where: { cityId: city.id, status: "ACTIVE" } }),
  ]);

  return (
    <div>
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
    </div>
  );
}
