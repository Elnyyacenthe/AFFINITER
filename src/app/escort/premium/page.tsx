import Link from "next/link";
import { Crown, Star, BadgeCheck, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatXAF } from "@/lib/utils";

const PLANS = [
  {
    tier: "STANDARD",
    name: "Standard",
    price: 0,
    icon: Check,
    color: "border-border",
    features: [
      "Publication gratuite",
      "Modération sous 24h",
      "Contact WhatsApp masqué",
      "5 photos max",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    price: 5000,
    icon: Star,
    color: "border-primary/50",
    badge: "Le plus choisi",
    features: [
      "Tout du Standard",
      "Mise en avant sur ville",
      "Badge Premium visible",
      "10 photos max",
      "30 jours de boost",
    ],
  },
  {
    tier: "VIP",
    name: "VIP",
    price: 15000,
    icon: Crown,
    color: "border-amber-500/50",
    badge: "Visibilité max",
    features: [
      "Tout du Premium",
      "Top de la page d'accueil",
      "Badge VIP doré",
      "Photos illimitées",
      "Boost prioritaire 30j",
      "Support dédié",
    ],
  },
];

export default function PremiumPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Boostez votre <span className="gradient-text">visibilité</span>
        </h1>
        <p className="text-muted-foreground">
          Passez en Premium ou VIP pour décupler le nombre de contacts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.tier} className={`relative ${plan.color}`}>
              {plan.badge && (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              <CardContent className="space-y-4 p-6">
                <Icon className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold">
                    {plan.price === 0 ? "Gratuit" : formatXAF(plan.price)}
                    {plan.price > 0 && <span className="text-sm text-muted-foreground"> / 30j</span>}
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={plan.tier === "STANDARD"}
                  className="w-full"
                  variant={plan.tier === "VIP" ? "accent" : "default"}
                >
                  {plan.tier === "STANDARD" ? "Plan actuel" : `Passer en ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-sky-500/30 bg-sky-500/5">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-sky-400" />
            <h3 className="font-display text-xl font-bold">Vérification d'identité</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Soumettez une pièce d'identité (CNI/passeport) + selfie avec une note datée du jour. Une fois vérifiée,
            vos annonces affichent le badge <strong>Vérifiée</strong>, ce qui augmente significativement la confiance des clients.
          </p>
          <Button variant="outline">Soumettre une vérification (bientôt)</Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Paiement par MTN Mobile Money / Orange Money. L'intégration complète sera disponible prochainement.
        Pour passer en Premium dès aujourd'hui, contactez{" "}
        <Link href="/contact" className="text-primary hover:underline">le support</Link>.
      </p>
    </div>
  );
}
