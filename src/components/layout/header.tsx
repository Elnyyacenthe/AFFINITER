import Link from "next/link";
import { cache } from "react";
import { Flame, Plus, Search, User, LayoutDashboard, Shield, Wallet, Heart, Gift } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatXAF } from "@/lib/utils";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * `cache()` dédoublonne automatiquement les appels identiques pendant une
 * même requête HTTP. Si plusieurs Server Components demandent le solde, on
 * fait une seule query Prisma au lieu de N. Évite aussi 2x auth().
 */
const getWalletBalance = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
});
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SITE_NAME } from "@/lib/utils";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  // Solde wallet à afficher dans le menu (dédoublonné via React cache)
  const dbUser = user ? await getWalletBalance(user.id) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-bold gradient-text">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/recherche" className="text-muted-foreground transition-colors hover:text-foreground">
            Rechercher
          </Link>
          <Link href="/ville/douala" className="text-muted-foreground transition-colors hover:text-foreground">
            Douala
          </Link>
          <Link href="/ville/yaounde" className="text-muted-foreground transition-colors hover:text-foreground">
            Yaoundé
          </Link>
          <Link href="/villes" className="text-muted-foreground transition-colors hover:text-foreground">
            Toutes les villes
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/recherche">
              <Search />
            </Link>
          </Button>

          {/* CTA adapté au rôle :
              - Visiteur          → "Devenir escort" (inscription role=ESCORT)
              - CLIENT connecté   → "Devenir escort" (upgrade compte → /client/devenir-escort)
              - ESCORT            → "Poster une annonce"
              - ADMIN / MODERATOR → rien */}
          {!user && (
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <Link href="/inscription?role=ESCORT">
                <Plus className="mr-1" />
                Devenir escort
              </Link>
            </Button>
          )}
          {user?.role === "CLIENT" && (
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <a
                href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.yamo.cm"}/client/devenir-escort`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus className="mr-1" />
                Devenir escort ↗
              </a>
            </Button>
          )}
          {user?.role === "ESCORT" && (
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <Link href="/poster-une-annonce">
                <Plus className="mr-1" />
                Poster une annonce
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-full outline-none ring-primary focus-visible:ring-2">
                  <Avatar className="h-9 w-9 border border-primary/40">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Avatar"} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              {/* Routing par rôle :
                  - ADMIN/MODERATOR → /admin (interne)
                  - ESCORT / CLIENT → dashboard.yamo.cm (externe, nouvelle fenêtre/tab)
                  La constante DASHBOARD_BASE est définie via env. */}
              {(() => {
                const dashboardBase =
                  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.yamo.cm";
                const isExternal =
                  user.role === "ESCORT" || user.role === "CLIENT";
                const nsRoot = user.role === "ESCORT" ? "/escort" : "/client";
                const nsUrl = isExternal ? `${dashboardBase}${nsRoot}` : null;

                return (
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>{user.name ?? user.email}</DropdownMenuLabel>
                    {nsUrl && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`${nsUrl}/portefeuille`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Portefeuille ↗
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {formatXAF(dbUser?.walletBalance ?? 0)}
                          </span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {user.role === "ESCORT" && nsUrl && (
                      <DropdownMenuItem asChild>
                        <a href={`${nsUrl}/dashboard`} target="_blank" rel="noopener noreferrer">
                          <LayoutDashboard className="h-4 w-4" /> Mon dashboard ↗
                        </a>
                      </DropdownMenuItem>
                    )}
                    {user.role === "CLIENT" && nsUrl && (
                      <DropdownMenuItem asChild>
                        <a href={nsUrl} target="_blank" rel="noopener noreferrer">
                          <LayoutDashboard className="h-4 w-4" /> Mon espace ↗
                        </a>
                      </DropdownMenuItem>
                    )}
                    {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="h-4 w-4" /> Administration
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {nsUrl && (
                      <>
                        <DropdownMenuItem asChild>
                          <a href={`${nsUrl}/favoris`} target="_blank" rel="noopener noreferrer">
                            <Heart className="h-4 w-4" /> Mes favoris ↗
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`${nsUrl}/parrainage`} target="_blank" rel="noopener noreferrer">
                            <Gift className="h-4 w-4" /> Parrainage ↗
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`${nsUrl}/compte`} target="_blank" rel="noopener noreferrer">
                            <User className="h-4 w-4" /> Mon compte ↗
                          </a>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                );
              })()}
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/inscription">Inscription</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
