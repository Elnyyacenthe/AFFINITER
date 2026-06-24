import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, BadgeCheck, MessageSquare, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME } from "@/lib/utils";
import { getEscortSubscriptionStatus } from "@/lib/escort-subscription";

export default async function EscortLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/dashboard");
  if (session.user.role !== "ESCORT" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  const sub = await getEscortSubscriptionStatus(session.user.id);

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="border-b border-border/60 bg-card/40 backdrop-blur md:border-b-0 md:border-r">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt={SITE_NAME} width={28} height={28} />
            <span className="font-display text-xl font-bold gradient-text">{SITE_NAME}</span>
          </Link>
        </div>
        <Separator />

        {/* Bandeau statut abonnement */}
        <div className="border-b border-border/40 p-4">
          {sub.isActive ? (
            <Link href="/escort/abonnement" className="block rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 transition hover:border-emerald-500/60">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" /> {sub.tier}
                </span>
                <Badge variant="success" className="text-[10px]">{sub.daysLeft}j</Badge>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Expire le {sub.until?.toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ) : (
            <Link href="/escort/abonnement" className="block rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 transition hover:border-amber-500">
              <p className="text-xs font-bold text-amber-300">⚠️ Abonnement requis</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Souscrivez pour publier vos annonces
              </p>
            </Link>
          )}
        </div>

        <div className="space-y-2 p-4">
          <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
            Espace Escort
          </p>
          <SidebarNav
            items={[
              { href: "/escort/dashboard", label: "Mon profil", icon: <User className="h-4 w-4" /> },
              { href: "/escort/abonnement", label: "Mon abonnement", icon: <Sparkles className="h-4 w-4" /> },
              { href: "/escort/verification", label: "Vérification ID", icon: <BadgeCheck className="h-4 w-4" /> },
              { href: "/support", label: "Service client", icon: <MessageSquare className="h-4 w-4" /> },
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
