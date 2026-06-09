import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Crown, BadgeCheck, Star, Eye, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhotoGallery } from "@/components/ads/photo-gallery";
import { ContactCard } from "@/components/ads/contact-card";
import { ReportButton } from "@/components/ads/report-button";
import { FavoriteButton } from "@/components/ads/favorite-button";
import { trackAdView } from "@/lib/actions/ads";
import { isFavoritedAction } from "@/lib/actions/favorites";
import { formatXAF, timeAgo, maskPhone, SITE_NAME } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = await prisma.ad.findUnique({
    where: { slug },
    include: { city: true, media: { take: 1 } },
  });
  if (!ad || ad.status !== "ACTIVE") return { title: "Annonce introuvable" };
  return {
    title: ad.title,
    description: ad.description.slice(0, 160),
    openGraph: {
      title: `${ad.title} · ${SITE_NAME}`,
      description: ad.description.slice(0, 160),
      images: ad.media[0] ? [{ url: ad.media[0].url }] : [],
    },
  };
}

export default async function AdPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = await prisma.ad.findUnique({
    where: { slug },
    include: {
      city: true,
      media: { where: { isApproved: true }, orderBy: { position: "asc" } },
      profile: true,
    },
  });

  if (!ad || (ad.status !== "ACTIVE" && ad.status !== "PAUSED")) notFound();

  // Tracking de la vue (async, ne bloque pas)
  trackAdView(ad.id).catch(() => null);

  const isFav = await isFavoritedAction(ad.id);

  return (
    <div className="container py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        {" / "}
        <Link href={`/ville/${ad.city.slug}`} className="hover:text-foreground">
          {ad.city.name}
        </Link>
        {" / "}
        <span className="text-foreground">{ad.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PhotoGallery media={ad.media} title={ad.title} />

          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {ad.tier === "VIP" && (
                <Badge variant="vip" className="gap-1">
                  <Crown className="h-3 w-3" /> VIP
                </Badge>
              )}
              {ad.tier === "PREMIUM" && (
                <Badge variant="premium" className="gap-1">
                  <Star className="h-3 w-3" /> Premium
                </Badge>
              )}
              {ad.profile?.isVerified && (
                <Badge variant="verified" className="gap-1">
                  <BadgeCheck className="h-3 w-3" /> Profil vérifié
                </Badge>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold md:text-4xl">{ad.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {ad.city.name}
                {ad.neighborhood ? `, ${ad.neighborhood}` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {ad.publishedAt ? timeAgo(ad.publishedAt) : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {ad.views} vues
              </span>
              {ad.profile?.age && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {ad.profile.age} ans
                </span>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-foreground/90">{ad.description}</p>
            </CardContent>
          </Card>

          {ad.services.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">Services proposés</h2>
                <div className="flex flex-wrap gap-2">
                  {ad.services.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Informations</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Prix / heure</dt>
                  <dd className="font-semibold text-primary">{formatXAF(ad.price)}</dd>
                </div>
                {ad.priceNight && (
                  <div>
                    <dt className="text-muted-foreground">Prix / nuit</dt>
                    <dd className="font-semibold">{formatXAF(ad.priceNight)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Reçoit</dt>
                  <dd>{ad.incall ? "Oui" : "Non"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Se déplace</dt>
                  <dd>{ad.outcall ? "Oui" : "Non"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Separator />
          <div className="flex items-center justify-between gap-2">
            <FavoriteButton adId={ad.id} initialFavorited={isFav} variant="default" />
            <ReportButton adId={ad.id} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ContactCard
            adId={ad.id}
            whatsappPhoneMasked={maskPhone(ad.whatsappPhone)}
            callPhoneMasked={ad.callPhone ? maskPhone(ad.callPhone) : null}
            adTitle={ad.title}
          />
        </aside>
      </div>
    </div>
  );
}
