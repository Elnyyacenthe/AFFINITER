import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Récupère le numéro WhatsApp d'une annonce APRÈS qu'un Payment REVEAL ait été
 * confirmé pour cet user + cette annonce.
 *
 * Sécurité :
 *   - Auth obligatoire
 *   - Le Payment doit appartenir à l'user
 *   - Payment.status doit être PAID + intentApplied
 *   - Intent.type doit être "REVEAL"
 *   - Intent.payload.adId doit matcher
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { userId: true, status: true, intentApplied: true, intent: true, adId: true },
  });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (payment.status !== "PAID" || !payment.intentApplied) {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  const intent = payment.intent as { type?: string; payload?: { adId?: string } } | null;
  if (intent?.type !== "REVEAL" || !intent.payload?.adId) {
    return NextResponse.json({ error: "Wrong intent type" }, { status: 400 });
  }

  const ad = await prisma.ad.findUnique({
    where: { id: intent.payload.adId },
    select: { whatsappPhone: true, title: true },
  });
  if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    phone: ad.whatsappPhone,
    adTitle: ad.title,
  });
}
