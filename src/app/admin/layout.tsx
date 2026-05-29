import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Users, ListChecks, Flag, CreditCard, BarChart3, Settings, BadgeCheck, Wallet, DollarSign, MapPin } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect("/");
  }

  // Compteurs pour les badges sidebar (cache courte durée)
  const [pendingAds, openReports, pendingVerifs, pendingWithdrawals] = await Promise.all([
    prisma.ad.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.idVerification.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="border-b border-border/60 bg-gradient-to-b from-card to-background md:border-b-0 md:border-r">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">{SITE_NAME} Admin</span>
          </Link>
        </div>
        <Separator />
        <div className="space-y-2 p-4">
          <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">Administration</p>
          <SidebarNav
            items={[
              { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
              { href: "/admin/moderation", label: "Modération", icon: ListChecks, badge: pendingAds },
              { href: "/admin/verifications", label: "Vérifications ID", icon: BadgeCheck, badge: pendingVerifs },
              { href: "/admin/annonces", label: "Toutes les annonces", icon: ListChecks },
              { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
              { href: "/admin/villes", label: "Villes", icon: MapPin },
              { href: "/admin/signalements", label: "Signalements", icon: Flag, badge: openReports },
              { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
              { href: "/admin/retraits", label: "Retraits", icon: Wallet, badge: pendingWithdrawals },
              { href: "/admin/tarifs", label: "Tarifs & Bonus", icon: DollarSign },
              { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
              { href: "/admin/reglages", label: "Réglages", icon: Settings },
            ]}
          />
          <Separator className="my-4" />
          <LogoutButton variant="button" />
        </div>
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
