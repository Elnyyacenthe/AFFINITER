import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron quotidien — abonnements escort :
 *   1. Notifie les abonnements qui expirent dans 3 jours (J-3)
 *   2. Désactive les abonnements expirés : tier=NONE
 *   3. Met en PAUSED les annonces actives des escortes sans abonnement
 *
 * Lancé via Vercel cron `0 8 * * *` (8h chaque matin).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 86_400_000);
  const yesterday = new Date(now.getTime() - 86_400_000);

  // 1) Notifs J-3 (une seule par abonnement actif)
  const expiringSoon = await prisma.user.findMany({
    where: {
      escortSubscriptionTier: { not: "NONE" },
      escortSubscriptionUntil: { gt: now, lte: in3Days },
    },
    select: { id: true, escortSubscriptionUntil: true, escortSubscriptionTier: true },
  });
  let notified = 0;
  for (const u of expiringSoon) {
    const recent = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        title: { contains: "Abonnement expire bientôt" },
        createdAt: { gte: yesterday },
      },
      select: { id: true },
    });
    if (recent) continue;
    const daysLeft = Math.ceil((u.escortSubscriptionUntil!.getTime() - now.getTime()) / 86_400_000);
    await prisma.notification.create({
      data: {
        userId: u.id,
        title: `Abonnement expire bientôt (${daysLeft}j)`,
        body: `Votre abonnement ${u.escortSubscriptionTier} expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}. Renouvelez maintenant pour ne pas perdre la publication de vos annonces.`,
        link: "/escort/abonnement",
      },
    });
    notified++;
  }

  // 2) Expirations : reset tier + pause annonces
  const expired = await prisma.user.findMany({
    where: {
      escortSubscriptionTier: { not: "NONE" },
      escortSubscriptionUntil: { lte: now },
    },
    select: { id: true },
  });

  let expiredCount = 0;
  let pausedAds = 0;
  for (const u of expired) {
    await prisma.user.update({
      where: { id: u.id },
      data: { escortSubscriptionTier: "NONE" },
    });
    const result = await prisma.ad.updateMany({
      where: { ownerId: u.id, status: "ACTIVE" },
      data: { status: "PAUSED" },
    });
    pausedAds += result.count;
    await prisma.notification.create({
      data: {
        userId: u.id,
        title: "Abonnement expiré",
        body: `Votre abonnement Affiniter a expiré. Toutes vos annonces ont été mises en pause. Renouvelez pour les réactiver.`,
        link: "/escort/abonnement",
      },
    });
    expiredCount++;
  }

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    notified,
    expiredCount,
    pausedAds,
  });
}
