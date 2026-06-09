import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSettingNumber } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron auto-renewal v2 — avec K-Pay direct on ne peut pas débiter sans PIN user,
 * donc on transforme l'auto-renew en NOTIFICATION D'EXPIRATION IMMINENTE.
 *
 * Si une annonce a `autoRenew=true` et expire dans les X heures, on envoie une
 * notif pour rappeler à l'escort de renouveler manuellement (paiement K-Pay direct).
 *
 * Anti-spam : 1 notif max par jour par annonce.
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
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const candidates = await prisma.ad.findMany({
    where: {
      autoRenew: true,
      tier: { in: ["PREMIUM", "VIP", "DIAMOND"] },
      promotedUntil: { gt: now, lte: horizon },
      status: "ACTIVE",
    },
    select: { id: true, ownerId: true, tier: true, title: true, promotedUntil: true },
  });

  let notified = 0;
  for (const ad of candidates) {
    const recent = await prisma.notification.findFirst({
      where: {
        userId: ad.ownerId,
        title: { contains: ad.title },
        link: "/escort/annonces",
        createdAt: { gte: yesterday },
      },
      select: { id: true },
    });
    if (recent) continue;

    const hoursLeft = Math.ceil(((ad.promotedUntil!.getTime() - now.getTime()) / 3600_000));
    await prisma.notification.create({
      data: {
        userId: ad.ownerId,
        title: `Renouvellement ${ad.tier} requis bientôt`,
        body: `Votre annonce "${ad.title}" expire dans ${hoursLeft}h. Renouvelez manuellement (paiement Mobile Money direct) pour ne pas perdre le tier.`,
        link: "/escort/annonces",
      },
    });
    notified++;
  }

  return NextResponse.json({ ok: true, candidates: candidates.length, notified });
}
