"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  ShieldAlert,
  Loader2,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KpayPayModal } from "@/components/kpay/kpay-pay-modal";
import { initiateRevealAction } from "@/lib/actions/payments";
import { isClientPassActive, revealNumberAction } from "@/lib/actions/client-pass";

interface Props {
  adId: string;
  /** Téléphone MASQUÉ depuis le server (ex: "237 67 65 •• 12"). Jamais le vrai numéro. */
  whatsappPhoneMasked: string;
  /** Numéro d'appel masqué (optionnel). */
  callPhoneMasked?: string | null;
  adTitle: string;
  /** Prix d'un reveal pay-per-contact (FCFA). Défaut 1000. */
  revealPrice?: number;
}

export function ContactCard({
  adId,
  whatsappPhoneMasked,
  callPhoneMasked,
  adTitle,
  revealPrice = 1000,
}: Props) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loadingFree, setLoadingFree] = useState(false);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  /** Tente une révélation gratuite (Pass Premium ou Anon/Free dans les caps). */
  async function tryFreeReveal(): Promise<boolean> {
    setLoadingFree(true);
    try {
      const passActive = await isClientPassActive();
      if (passActive) {
        const r = await revealNumberAction(adId);
        if (r.ok) {
          setPhone(r.phone);
          toast.success("Numéro débloqué 💎 (Pass Premium)");
          return true;
        }
      }
      return false;
    } finally {
      setLoadingFree(false);
    }
  }

  /** Ouvre WhatsApp avec un numéro révélé. */
  function openWhatsApp(p: string) {
    const cleanWa = p.replace(/\s/g, "").replace(/^\+/, "");
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
      `Bonjour, je vous écris au sujet de votre annonce "${adTitle}" sur Yamo.`,
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  /** Clic sur "Contacter sur WhatsApp" — Pass Premium d'abord, sinon paiement. */
  async function handleContactClick() {
    if (phone) {
      openWhatsApp(phone);
      return;
    }
    const freed = await tryFreeReveal();
    if (freed) return; // tryFreeReveal a déjà setPhone, on ouvre WhatsApp à la prochaine itération via useEffect
    // Pas de Pass Premium → on ouvre le modal de paiement
    modalTriggerRef.current?.click();
  }

  /** Callback après paiement K-Pay confirmé → fetch le numéro + ouvre WhatsApp. */
  async function onPaymentSuccess(paymentId: string) {
    try {
      const r = await fetch(`/api/payments/${paymentId}/reveal`, { cache: "no-store" });
      if (!r.ok) {
        toast.error("Impossible de récupérer le contact, contactez le support.");
        return;
      }
      const data = (await r.json()) as { phone: string };
      setPhone(data.phone);
      openWhatsApp(data.phone);
    } catch {
      toast.error("Erreur réseau");
    }
  }

  const display = phone ?? whatsappPhoneMasked;

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="mb-1 text-xs uppercase text-muted-foreground">WhatsApp</p>
          <div className="flex items-center gap-2 font-mono text-lg">
            <span className="select-all">{display}</span>
            {!phone && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {!phone && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs">
            <p className="flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Contact débloqué pour {revealPrice.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="mt-1 text-muted-foreground">
              Paiement Mobile Money sécurisé via K-Pay. Redirection WhatsApp immédiate après confirmation.
            </p>
          </div>
        )}

        <Button
          onClick={handleContactClick}
          disabled={loadingFree}
          size="lg"
          className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {loadingFree ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          {phone
            ? "Contacter sur WhatsApp"
            : `Payer ${revealPrice.toLocaleString("fr-FR")} FCFA & contacter`}
        </Button>

        {callPhoneMasked && phone && (
          <Button
            onClick={() => {
              window.location.href = `tel:${phone}`;
            }}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Phone className="h-5 w-5" /> Appeler
          </Button>
        )}

        {/* Trigger caché du modal — déclenché par handleContactClick */}
        <KpayPayModal
          trigger={
            <button
              ref={modalTriggerRef}
              className="hidden"
              type="button"
              aria-label="Ouvrir le paiement"
            />
          }
          title="Débloquer le contact WhatsApp"
          description={`Paiement Mobile Money de ${revealPrice.toLocaleString("fr-FR")} FCFA pour révéler le numéro et ouvrir WhatsApp avec cette escort.`}
          amount={revealPrice}
          initiate={(payerPhone) => initiateRevealAction({ adId, phone: payerPhone })}
          onSuccessWithPaymentId={onPaymentSuccess}
        />

        {!phone && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="flex items-center gap-2 font-semibold">
              <Crown className="h-4 w-4 text-amber-400" />
              Pass Premium 💎
            </p>
            <p className="mt-1 text-muted-foreground">
              Pour 1 000 FCFA / mois, contactez <strong>toutes les escorts illimités</strong>.
              Plus rentable si vous comptez écrire à plusieurs annonceurs.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2 w-full">
              <Link href="/client/pass-premium">Activer Pass Premium (1 mois)</Link>
            </Button>
          </div>
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
