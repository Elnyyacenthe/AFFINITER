"use client";

import { useState } from "react";
import { MessageCircle, Phone, ShieldAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackWhatsAppClick } from "@/lib/actions/ads";

interface Props {
  adId: string;
  /** Numéro WhatsApp complet (affiché directement, contact gratuit). */
  whatsappPhone: string;
  /** Numéro d'appel (optionnel). */
  callPhone?: string | null;
  adTitle: string;
}

export function ContactCard({ adId, whatsappPhone, callPhone, adTitle }: Props) {
  const [opening, setOpening] = useState(false);

  function openWhatsApp() {
    setOpening(true);
    // Track non-bloquant (fire & forget)
    trackWhatsAppClick(adId).catch(() => null);

    const cleanWa = whatsappPhone.replace(/\s/g, "").replace(/^\+/, "");
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
      `Bonjour, je vous écris au sujet de votre annonce "${adTitle}" sur Affiniter.`,
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setOpening(false), 800);
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="mb-1 text-xs uppercase text-muted-foreground">WhatsApp</p>
          <p className="select-all font-mono text-lg">{whatsappPhone}</p>
        </div>

        <Button
          onClick={openWhatsApp}
          disabled={opening}
          size="lg"
          className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {opening ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          Contacter sur WhatsApp
        </Button>

        {callPhone && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <a href={`tel:${callPhone}`}>
              <Phone className="h-5 w-5" /> Appeler
            </a>
          </Button>
        )}

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <p className="flex items-start gap-2 font-semibold">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Sécurité : ne payez jamais d'avance avant de rencontrer la personne. Signalez tout comportement suspect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
