"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { KpayPayModal } from "@/components/kpay/kpay-pay-modal";
import { initiateEscortSubscriptionAction } from "@/lib/actions/payments";

const DURATIONS = [
  { months: 1 as const, label: "1 mois" },
  { months: 3 as const, label: "3 mois", discount: 5 },
  { months: 12 as const, label: "1 an", discount: 15 },
];

export function SubscribeButtons({
  tier,
  monthly,
  defaultPhone,
}: {
  tier: "STANDARD" | "PREMIUM" | "VIP";
  monthly: number;
  defaultPhone?: string;
}) {
  const [months, setMonths] = useState<1 | 3 | 12>(1);
  const total = monthly * months;

  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-3 gap-1">
        {DURATIONS.map((d) => (
          <button
            key={d.months}
            type="button"
            onClick={() => setMonths(d.months)}
            className={`rounded-md border p-1.5 text-[10px] transition ${
              months === d.months
                ? "border-primary bg-primary/15"
                : "border-border hover:border-primary/40"
            }`}
          >
            <p className="font-bold">{d.label}</p>
            {d.discount && (
              <p className="text-[9px] text-emerald-400">−{d.discount}% (à venir)</p>
            )}
          </button>
        ))}
      </div>

      <KpayPayModal
        trigger={
          <Button className="w-full" size="sm">
            Souscrire — {total.toLocaleString("fr-FR")} FCFA
          </Button>
        }
        title={`Abonnement ${tier} ${months} mois`}
        description={`Activation immédiate après confirmation du paiement. Renouvellement manuel.`}
        amount={total}
        defaultPhone={defaultPhone}
        initiate={(phone) => initiateEscortSubscriptionAction({ tier, months, phone })}
      />
    </div>
  );
}
