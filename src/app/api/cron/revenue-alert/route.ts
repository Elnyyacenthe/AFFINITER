import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSettingNumber } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron I14 — alerte revenus quotidienne.
 *
 * Chaque jour à 9h, compare les revenus des dernières 24h au seuil défini.
 * Si en dessous → notification aux ADMIN.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = await getSettingNumber("alerts.revenue.daily.threshold", 20000);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const revenue = await prisma.payment.aggregate({
    where: { status: "PAID", paidAt: { gte: since } },
    _sum: { amount: true },
    _count: true,
  });

  const total = revenue._sum.amount ?? 0;

  if (total >= threshold) {
    return NextResponse.json({ ok: true, alert: false, total, threshold });
  }

  // Sinon, alerte aux admins
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MODERATOR"] } },
    select: { id: true },
  });

  if (admins.length === 0) {
    return NextResponse.json({ ok: true, alert: true, total, threshold, notifiedAdmins: 0 });
  }

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      title: `⚠️ Revenus 24h en baisse`,
      body: `Revenus des dernières 24h : ${total.toLocaleString("fr-FR")} FCFA (seuil ${threshold.toLocaleString("fr-FR")} FCFA). ${revenue._count} transactions. Vérifiez l'activité.`,
      link: "/admin/statistiques",
    })),
  });

  return NextResponse.json({
    ok: true,
    alert: true,
    total,
    threshold,
    notifiedAdmins: admins.length,
  });
}
