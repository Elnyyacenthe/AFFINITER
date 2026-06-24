import { redirect } from "next/navigation";
import { CreditCard, Check, Crown, Star, Sparkles, AlertTriangle } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSettingNumber } from "@/lib/settings";
import { getEscortSubscriptionStatus } from "@/lib/escort-subscription";
import { SubscribeButtons } from "./_buttons";

export default async function EscortAbonnementPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/abonnement");

  const [status, user, stdPrice, premPrice, vipPrice, days] = await Promise.all([
    getEscortSubscriptionStatus(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    }),
    getSettingNumber("pricing.escortSubscription.standard.amount", 2000),
    getSettingNumber("pricing.escortSubscription.premium.amount", 5000),
    getSettingNumber("pricing.escortSubscription.vip.amount", 15000),
    getSettingNumber("pricing.escortSubscription.days", 30),
  ]);

  const PLANS = [
    {
      tier: "STANDARD" as const,
      name: "Standard",
      monthly: stdPrice,
      icon: Check,
      color: "border-border",
      features: ["1 annonce active", "3 photos max", "Tri normal", "Bump 500 FCFA/clic"],
    },
    {
      tier: "PREMIUM" as const,
      name: "Premium",
      monthly: premPrice,
      icon: Star,
      color: "border-primary/50",
      badge: "Recommandé",
      features: ["3 annonces actives", "10 photos par annonce", "Mise en avant ville", "Badge Premium", "Sticky 2 000 FCFA/clic"],
    },
    {
      tier: "VIP" as const,
      name: "VIP",
      monthly: vipPrice,
      icon: Crown,
      color: "border-amber-500/50",
      badge: "Visibilité max",
      features: ["Annonces illimitées", "50 photos par annonce", "Top homepage", "Badge VIP doré", "Sticky inclus", "Support prioritaire"],
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <CreditCard className="h-7 w-7 text-primary" /> Mon abonnement
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abonnement mensuel obligatoire pour publier. Paiement Mobile Money via K-Pay.
        </p>
      </header>

      {/* Statut actuel */}
      {status.isActive ? (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center">
            <Sparkles className="h-10 w-10 text-emerald-400" />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">
                Abonnement <span className="gradient-text">{status.tier}</span> actif
              </p>
              <p className="text-sm text-muted-foreground">
                Valable jusqu'au{" "}
                <strong>{status.until!.toLocaleDateString("fr-FR")}</strong>
                {" "}({status.daysLeft} jour{status.daysLeft > 1 ? "s" : ""} restant
                {status.daysLeft > 1 ? "s" : ""})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quotas : {status.caps.ads} annonce{status.caps.ads > 1 ? "s" : ""} active{status.caps.ads > 1 ? "s" : ""} · {status.caps.photos} photos / annonce
              </p>
            </div>
            <Badge variant="success">ACTIF</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold">Aucun abonnement actif</p>
              <p className="text-sm text-muted-foreground">
                Vous ne pouvez pas publier d'annonce. Souscrivez à l'un des plans ci-dessous pour activer votre compte escort sur Affinité.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3 tiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = status.isActive && status.tier === plan.tier;
          return (
            <Card key={plan.tier} className={`relative ${plan.color} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
              {plan.badge && !isCurrent && (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Votre plan actuel
                </Badge>
              )}
              <CardContent className="space-y-4 p-6">
                <Icon className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold">
                    {plan.monthly.toLocaleString("fr-FR")}{" "}
                    <span className="text-sm font-normal text-muted-foreground">FCFA / {days}j</span>
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                <SubscribeButtons
                  tier={plan.tier}
                  monthly={plan.monthly}
                  defaultPhone={user?.phone ?? undefined}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Paiement sécurisé via K-Pay (MTN Mobile Money / Orange Money). Aucune carte bancaire requise.
        Renouvellement manuel — vous serez prévenu(e) 3 jours avant l'expiration.
      </p>
    </div>
  );
}
