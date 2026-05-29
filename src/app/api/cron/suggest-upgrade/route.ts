import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSettingNumber } from "@/lib/actions/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron I11 — auto-suggestion d'upgrade.
 *
 * Quand une annonce STANDARD reçoit > X vues / jour pendant 2 jours consécutifs,
 * on suggère à l'escort de passer en Premium (notif + lien).
 * Anti-spam : pas plus d'1 suggestion / semaine par annonce.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const minViews = await getSettingNumber("autoSuggest.minViewsForUpgrade", 10);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Aggregate vues / annonce sur 24h
  const views = await prisma.adView.groupBy({
    by: ["adId"],
    where: { createdAt: { gte: since } },
    _count: true,
    having: { adId: { _count: { gte: minViews } } },
  });

  if (views.length === 0) {
    return NextResponse.json({ ok: true, suggested: 0 });
  }

  // Récupère les ads STANDARD parmi celles qui cartonnent
  const ads = await prisma.ad.findMany({
    where: {
      id: { in: views.map((v) => v.adId) },
      tier: "STANDARD",
      status: "ACTIVE",
    },
    select: { id: true, ownerId: true, title: true },
  });

  if (ads.length === 0) {
    return NextResponse.json({ ok: true, suggested: 0 });
  }

  // Anti-spam : déjà notifié dans les 7 jours ?
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentNotifs = await prisma.notification.findMany({
    where: {
      userId: { in: ads.map((a) => a.ownerId) },
      title: { startsWith: "Tu cartonnes" },
      createdAt: { gte: oneWeekAgo },
    },
    select: { userId: true },
  });
  const blocked = new Set(recentNotifs.map((n) => n.userId));

  const toNotify = ads.filter((a) => !blocked.has(a.ownerId));
  if (toNotify.length === 0) {
    return NextResponse.json({ ok: true, suggested: 0, skipped: ads.length });
  }

  await prisma.notification.createMany({
    data: toNotify.map((a) => ({
      userId: a.ownerId,
      title: `Tu cartonnes 🚀 — Passe en Premium !`,
      body: `Votre annonce "${a.title}" reçoit plus de ${minViews} vues par jour. En Premium ou VIP, multipliez vos contacts par 3 à 7.`,
      link: "/escort/premium",
    })),
  });

  return NextResponse.json({ ok: true, suggested: toNotify.length });
}
