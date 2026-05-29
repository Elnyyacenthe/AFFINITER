import Link from "next/link";
import { Flame, Plus, Search, User, LayoutDashboard, Shield, Wallet, Heart, Gift } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatXAF } from "@/lib/utils";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
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

  // Solde wallet à afficher dans le menu (server-side)
  const dbUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true },
      })
    : null;

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

          {/* CTA "Poster une annonce" — caché pour ADMIN et MODERATOR
              (ils gèrent le site, ne postent pas).
              Pour CLIENT, le clic déclenche un auto-upgrade en ESCORT. */}
          {(!user || user.role === "CLIENT" || user.role === "ESCORT") && (
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
                  - ADMIN/MODERATOR → /admin
                  - ESCORT          → /escort/*
                  - CLIENT          → /client/*  */}
              {(() => {
                const ns =
                  user.role === "ADMIN" || user.role === "MODERATOR"
                    ? null
                    : user.role === "ESCORT"
                      ? "/escort"
                      : "/client";
                return (
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>{user.name ?? user.email}</DropdownMenuLabel>
                    {ns && (
                      <DropdownMenuItem asChild>
                        <Link href={`${ns}/portefeuille`} className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Portefeuille
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {formatXAF(dbUser?.walletBalance ?? 0)}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {user.role === "ESCORT" && (
                      <DropdownMenuItem asChild>
                        <Link href="/escort/dashboard">
                          <LayoutDashboard className="h-4 w-4" /> Mon dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "CLIENT" && (
                      <DropdownMenuItem asChild>
                        <Link href="/client">
                          <LayoutDashboard className="h-4 w-4" /> Mon espace
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="h-4 w-4" /> Administration
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {ns && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`${ns}/favoris`}>
                            <Heart className="h-4 w-4" /> Mes favoris
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`${ns}/parrainage`}>
                            <Gift className="h-4 w-4" /> Parrainage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`${ns}/compte`}>
                            <User className="h-4 w-4" /> Mon compte
                          </Link>
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
