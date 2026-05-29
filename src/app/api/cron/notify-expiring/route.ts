import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSettingNumber } from "@/lib/actions/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron Vercel — exécuté chaque jour à 8h (cf. vercel.json).
 *
 * Mission :
 *   1. Trouver les annonces dont le tier Premium/VIP expire dans X jours
 *      (default 3, configurable via `expiry.notify.daysBefore`).
 *   2. Notifier l'escort propriétaire pour qu'elle renouvelle.
 *   3. Éviter de notifier 2x la même annonce dans la même fenêtre
 *      (on regarde s'il existe déjà une notif récente sur cette annonce).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daysBefore = await getSettingNumber("expiry.notify.daysBefore", 3);
  const now = new Date();
  const threshold = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);

  // Annonces expirant entre maintenant et le threshold (J-X)
  const expiring = await prisma.ad.findMany({
    where: {
      tier: { in: ["PREMIUM", "VIP"] },
      promotedUntil: { gte: now, lte: threshold },
    },
    select: { id: true, tier: true, ownerId: true, title: true, promotedUntil: true },
  });

  if (expiring.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 });
  }

  // Filtrage anti-doublon : déjà notifié dans les 24h ?
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent = await prisma.notification.findMany({
    where: {
      userId: { in: expiring.map((a) => a.ownerId) },
      title: { startsWith: "Boost" },
      createdAt: { gte: since },
    },
    select: { userId: true },
  });
  const recentSet = new Set(recent.map((n) => n.userId));

  const toNotify = expiring.filter((a) => !recentSet.has(a.ownerId));
  if (toNotify.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, skipped: expiring.length });
  }

  await prisma.notification.createMany({
    data: toNotify.map((a) => {
      const daysLeft = Math.ceil(
        ((a.promotedUntil?.getTime() ?? now.getTime()) - now.getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        userId: a.ownerId,
        title: `Boost ${a.tier} expire dans ${daysLeft}j ⏳`,
        body: `Votre annonce "${a.title}" perdra le statut ${a.tier} dans ${daysLeft} jour(s). Renouvelez maintenant pour conserver votre visibilité.`,
        link: "/escort/annonces",
      };
    }),
  });

  return NextResponse.json({ ok: true, notified: toNotify.length, totalExpiring: expiring.length });
}
