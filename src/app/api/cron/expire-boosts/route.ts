import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron Vercel — exécuté chaque heure (cf. vercel.json).
 *
 * Mission :
 *   1. Trouver les annonces dont le boost Premium/VIP a expiré (promotedUntil < now)
 *   2. Les ramener au tier STANDARD
 *   3. Logger dans AuditLog
 *   4. Notifier l'escort propriétaire ("Votre boost VIP a expiré")
 *
 * Sécurité :
 *   - Authentification via CRON_SECRET (header `Authorization: Bearer <secret>`)
 *   - Vercel ajoute automatiquement ce header pour ses cron jobs
 */
export async function GET(req: Request) {
  // Vérification du secret
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Récupère les annonces à expirer (boostées dont la durée est dépassée)
  const expired = await prisma.ad.findMany({
    where: {
      tier: { in: ["PREMIUM", "VIP"] },
      promotedUntil: { lte: now },
    },
    select: { id: true, tier: true, ownerId: true, title: true, slug: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, durationMs: 0 });
  }

  const start = Date.now();

  // Transaction : reset tier + log + notif
  await prisma.$transaction([
    prisma.ad.updateMany({
      where: { id: { in: expired.map((a) => a.id) } },
      data: { tier: "STANDARD", promotedUntil: null },
    }),
    prisma.auditLog.createMany({
      data: expired.map((a) => ({
        action: "BOOST_EXPIRED",
        entity: "Ad",
        entityId: a.id,
        metadata: { previousTier: a.tier, expiredAt: now.toISOString() },
      })),
    }),
    prisma.notification.createMany({
      data: expired.map((a) => ({
        userId: a.ownerId,
        title: `Votre boost ${a.tier} a expiré`,
        body: `L'annonce "${a.title}" est revenue au plan Standard. Renouvelez pour conserver votre visibilité.`,
        link: "/escort/annonces",
      })),
    }),
  ]);

  return NextResponse.json({
    ok: true,
    expired: expired.length,
    durationMs: Date.now() - start,
  });
}
