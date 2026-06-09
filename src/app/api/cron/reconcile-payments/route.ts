import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkAndApplyIntent } from "@/lib/kpay-direct";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Filet de sécurité v2 : réconcilie les Payment PENDING avec K-Pay.
 *
 * Modèle v2 (one-shot direct) :
 *   - Chaque Payment porte un `intent` (BUMP, STICKY, TIER_UPGRADE, PHOTO_SERVICE, VERIFICATION, CLIENT_PASS)
 *   - Au succès K-Pay, on applique l'intent (idempotent via `intentApplied`)
 *   - Plus de wallet : aucun crédit/débit à appliquer
 *
 * Appelé par :
 *   - Vercel cron (vercel.json) — toutes les 5 min
 *   - Supabase pg_cron — toutes les 5 min
 *   - Manuel admin (debug)
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stats = {
    checked: 0,
    applied: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
  };

  // Payments PENDING avec un intent, entre 5 min et 24h, providerRef K-Pay valide
  const pending = await prisma.payment.findMany({
    where: {
      status: "PENDING",
      intentApplied: false,
      intent: { not: undefined },
      provider: "MTN_MOMO",
      providerRef: { startsWith: "pay_" },
      createdAt: { lte: fiveMinAgo, gte: oneDayAgo },
    },
    select: { id: true },
    take: 50,
  });

  for (const p of pending) {
    stats.checked++;
    try {
      const res = await checkAndApplyIntent(p.id);
      if (!res.ok) {
        stats.errors++;
      } else if (res.status === "SUCCESS" && res.applied) {
        stats.applied++;
      } else if (res.status === "FAILED") {
        stats.failed++;
      } else {
        stats.stillPending++;
      }
    } catch {
      stats.errors++;
    }
  }

  return NextResponse.json({ ok: true, runAt: new Date().toISOString(), ...stats });
}
