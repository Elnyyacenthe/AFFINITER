"use client";

import { useState } from "react";
import { Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatXAF } from "@/lib/utils";
import { KpayPayModal } from "@/components/kpay/kpay-pay-modal";
import { initiateClientPassAction } from "@/lib/actions/payments";

interface Props {
  monthlyPrice: number;
  defaultPhone?: string;
  alreadyActive: boolean;
}

const DURATIONS = [
  { months: 1 as const, label: "1 mois", discount: 0 },
  { months: 3 as const, label: "3 mois", discount: 5 },
  { months: 12 as const, label: "12 mois", discount: 20 },
];

export function SubscribeForm({ monthlyPrice, defaultPhone, alreadyActive }: Props) {
  const [months, setMonths] = useState<1 | 3 | 12>(1);
  const total = monthlyPrice * months;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d.months}
            type="button"
            onClick={() => setMonths(d.months)}
            className={`rounded-lg border p-3 text-left text-sm transition ${
              months === d.months
                ? "border-primary bg-primary/15"
                : "border-border hover:border-primary/40"
            }`}
          >
            <p className="font-bold">{d.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatXAF(monthlyPrice * d.months)}
            </p>
            {d.discount > 0 && (
              <p className="mt-1 text-[10px] font-bold text-emerald-400">
                à venir : -{d.discount}%
              </p>
            )}
          </button>
        ))}
      </div>

      <KpayPayModal
        trigger={
          <Button size="lg" className="w-full" variant="accent">
            <Crown className="h-4 w-4" />
            {alreadyActive ? `Prolonger : ${formatXAF(total)}` : `S'abonner : ${formatXAF(total)}`}
          </Button>
        }
        title={`Pass Premium — ${months} mois`}
        description="Révélations WhatsApp illimitées, navigation incognito, accès prioritaire. Paiement Mobile Money."
        amount={total}
        defaultPhone={defaultPhone}
        initiate={(phone) => initiateClientPassAction({ months, phone })}
      />
    </div>
  );
}
