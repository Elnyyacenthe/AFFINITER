import { NextResponse } from "next/server";
import type { AdTier } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSettingNumber, applyWalletDelta } from "@/lib/actions/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron auto-renewal — exécuté chaque heure.
 *
 * Mission :
 *   1. Trouver les ads avec autoRenew=true dont promotedUntil est dans les X heures
 *   2. Tenter de débiter le wallet du même tier+durée
 *   3. Si OK → étendre promotedUntil
 *   4. Si KO (solde insuffisant) → notifier l'escort
 *
 * Anti-spam : si déjà tenté il y a moins de 6h, skip.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tryBeforeH = await getSettingNumber("autoRenew.tryBefore.hours", 12);
  const now = new Date();
  const horizon = new Date(now.getTime() + tryBeforeH * 60 * 60 * 1000);

  // Ads candidates : auto-renew on, expire dans les `tryBeforeH` heures
  const candidates = await prisma.ad.findMany({
    where: {
      autoRenew: true,
      tier: { in: ["PREMIUM", "VIP", "DIAMOND"] },
      promotedUntil: { gt: now, lte: horizon },
      status: "ACTIVE",
    },
    select: { id: true, ownerId: true, tier: true, title: true, promotedUntil: true, cityId: true },
  });

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const results: Array<{ adId: string; status: "RENEWED" | "FAILED"; reason?: string }> = [];

  for (const ad of candidates) {
    const tier = ad.tier as Exclude<AdTier, "STANDARD">;
    // Anti-spam : déjà tenté il y a moins de 6h ?
    const recentAttempt = await prisma.walletTransaction.findFirst({
      where: {
        userId: ad.ownerId,
        type: "BOOST_PAYMENT",
        reference: { startsWith: `autorenew_${ad.id}_` },
        createdAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
      },
    });
    if (recentAttempt) continue;

    // Tarif du tier
    const priceKey =
      tier === "DIAMOND" ? "pricing.diamond.amount"
      : tier === "VIP" ? "pricing.vip.amount"
      : "pricing.premium.amount";
    const daysKey =
      tier === "DIAMOND" ? "pricing.diamond.days"
      : tier === "VIP" ? "pricing.vip.days"
      : "pricing.premium.days";
    const fallbackPrice = tier === "DIAMOND" ? 50000 : tier === "VIP" ? 15000 : 5000;
    const price = await getSettingNumber(priceKey, fallbackPrice);
    const days = await getSettingNumber(daysKey, 30);

    // Si Diamond, vérifier scarcité
    if (tier === "DIAMOND") {
      const other = await prisma.ad.findFirst({
        where: {
          cityId: ad.cityId,
          tier: "DIAMOND",
          promotedUntil: { gt: now },
          NOT: { id: ad.id },
        },
      });
      if (other) {
        await prisma.notification.create({
          data: {
            userId: ad.ownerId,
            title: "Auto-renewal Diamond impossible",
            body: `Le slot DIAMOND de votre ville est pris par une autre annonce. Renouvelez manuellement en VIP.`,
            link: "/escort/annonces",
          },
        });
        results.push({ adId: ad.id, status: "FAILED", reason: "DIAMOND_SLOT_TAKEN" });
        continue;
      }
    }

    // Tentative de débit
    try {
      await applyWalletDelta({
        userId: ad.ownerId,
        amount: -price,
        type: "BOOST_PAYMENT",
        description: `Auto-renouvellement ${tier} de "${ad.title}"`,
        reference: `autorenew_${ad.id}_${Date.now()}`,
        metadata: { adId: ad.id, type: "AUTO_RENEW", tier, days },
      });

      // Étendre promotedUntil
      const baseTime = ad.promotedUntil && ad.promotedUntil > now ? ad.promotedUntil : now;
      const newUntil = new Date(baseTime.getTime() + days * 86_400_000);
      await prisma.ad.update({
        where: { id: ad.id },
        data: { promotedUntil: newUntil },
      });
      await prisma.payment.create({
        data: {
          userId: ad.ownerId,
          adId: ad.id,
          amount: price,
          provider: "WALLET",
          status: "PAID",
          tier,
          durationDays: days,
          paidAt: now,
          metadata: { type: "AUTO_RENEW" },
        },
      });
      await prisma.notification.create({
        data: {
          userId: ad.ownerId,
          title: `Auto-renouvellement ${tier} ✅`,
          body: `Votre annonce "${ad.title}" reste ${tier} pour ${days} jours (${price} FCFA débités).`,
          link: "/escort/annonces",
        },
      });
      results.push({ adId: ad.id, status: "RENEWED" });
    } catch (e) {
      await prisma.notification.create({
        data: {
          userId: ad.ownerId,
          title: "Auto-renewal échoué — solde insuffisant",
          body: `Impossible de renouveler "${ad.title}" (${tier}, ${price} FCFA requis). Rechargez votre wallet maintenant.`,
          link: "/escort/portefeuille",
        },
      });
      results.push({ adId: ad.id, status: "FAILED", reason: e instanceof Error ? e.message : "?" });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
