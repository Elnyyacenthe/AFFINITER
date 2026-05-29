import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AdForm } from "@/components/ads/ad-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Poster une annonce",
  description: "Publiez gratuitement votre annonce escort au Cameroun.",
};

export default async function PostAdPage() {
  const session = await auth();
  const cities = await prisma.city.findMany({
    select: { id: true, name: true },
    orderBy: [{ isPopular: "desc" }, { name: "asc" }],
  });

  if (!session?.user) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Connectez-vous pour publier</h1>
            <p className="text-sm text-muted-foreground">
              Vous devez avoir un compte pour publier une annonce.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/connexion">Se connecter</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/inscription?role=ESCORT">Créer un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Blocage des rôles admin/moderator : ils n'ont rien à faire ici
  if (session.user.role === "ADMIN" || session.user.role === "MODERATOR") {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-md border-amber-500/30 bg-amber-500/5">
          <CardContent className="space-y-4 p-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-amber-400" />
            <h1 className="font-display text-2xl font-bold">Accès limité</h1>
            <p className="text-sm text-muted-foreground">
              Les comptes <strong>administrateur</strong> ne peuvent pas publier d'annonces.
              Utilisez un compte escort pour tester la publication.
            </p>
            <Button asChild>
              <Link href="/admin">Retour à l'administration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClientUpgrade = session.user.role === "CLIENT";

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">
          Poster une <span className="gradient-text">annonce</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Votre annonce sera examinée par notre équipe sous 24h avant publication.
        </p>

        {isClientUpgrade && (
          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold">Vous passez en compte <span className="gradient-text">Escort</span></p>
                <p className="text-muted-foreground">
                  En publiant cette annonce, votre compte client sera automatiquement converti en compte escort.
                  Vous aurez alors accès au dashboard, statistiques et options Premium.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <AdForm cities={cities} />
        </div>
      </div>
    </div>
  );
}
