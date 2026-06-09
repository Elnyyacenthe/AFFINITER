"use client";

import { useState, useTransition } from "react";
import { Pause, Play, Trash2, Loader2, ArrowUp, Pin, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleAdStatusAction, deleteAdAction, setAutoRenewAction } from "@/lib/actions/ads";
import { initiateBumpAction, initiateStickyAction } from "@/lib/actions/payments";
import { KpayPayModal } from "@/components/kpay/kpay-pay-modal";

export function ToggleAdButton({ adId, isActive }: { adId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await toggleAdStatusAction(adId);
            toast.success(isActive ? "Annonce mise en pause" : "Annonce réactivée");
          } catch {
            toast.error("Erreur");
          }
        })
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {isActive ? "Pause" : "Activer"}
    </Button>
  );
}

export function DeleteAdButton({ adId }: { adId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer définitivement cette annonce ?")) return;
        startTransition(async () => {
          try {
            await deleteAdAction(adId);
            toast.success("Annonce supprimée");
          } catch {
            toast.error("Impossible de supprimer");
          }
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Bouton Bump : modal K-Pay direct (saisie phone + polling).
 */
export function BumpAdButton({
  adId,
  price = 500,
  defaultPhone,
}: {
  adId: string;
  price?: number;
  defaultPhone?: string;
}) {
  return (
    <KpayPayModal
      trigger={
        <Button variant="accent" size="sm">
          <ArrowUp className="h-4 w-4" /> Bump
        </Button>
      }
      title="Bump — remontée 24h"
      description="Votre annonce remonte en tête des résultats pendant ~24h. Cooldown 6h entre 2 bumps."
      amount={price}
      defaultPhone={defaultPhone}
      initiate={(phone) => initiateBumpAction({ adId, phone })}
    />
  );
}

/**
 * Bouton Sticky 24h : épingle l'annonce au top de sa ville pendant 24h.
 */
export function StickyAdButton({
  adId,
  price = 2000,
  defaultPhone,
}: {
  adId: string;
  price?: number;
  defaultPhone?: string;
}) {
  return (
    <KpayPayModal
      trigger={
        <Button variant="default" size="sm">
          <Pin className="h-4 w-4" /> Sticky 24h
        </Button>
      }
      title="Sticky — épinglé au top de la ville"
      description="Votre annonce reste au sommet de la page ville pendant 24h. Cumulable."
      amount={price}
      defaultPhone={defaultPhone}
      initiate={(phone) => initiateStickyAction({ adId, phone })}
    />
  );
}

/**
 * Toggle Auto-renewal — l'annonce sera renouvelée par le cron auto-renew
 * via un paiement K-Pay sur le numéro enregistré.
 */
export function AutoRenewToggle({
  adId,
  initial,
}: {
  adId: string;
  initial: boolean;
}) {
  const [enabled, setEnabled] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const res = await setAutoRenewAction({ adId, enabled: next });
      if (res.ok) {
        toast.success(next ? "Auto-renouvellement activé ♻️" : "Auto-renouvellement désactivé");
      } else {
        setEnabled(!next);
        toast.error(res.error);
      }
    });
  }

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      disabled={pending}
      onClick={toggle}
      title="Renouvelle automatiquement le boost à expiration"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {enabled ? "Auto-renew ON" : "Auto-renew OFF"}
    </Button>
  );
}
