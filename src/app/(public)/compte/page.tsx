import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { ads: true } } },
  });
  if (!user) redirect("/connexion");

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-bold">Mon compte</h1>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{user.name ?? "Sans nom"}</h2>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.phone}</p>
            <p className="text-xs text-muted-foreground">
              Inscrit {timeAgo(user.createdAt)} · {user._count.ads} annonce
              {user._count.ads > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {user.role === "ESCORT" && (
          <Button asChild className="w-full">
            <Link href="/escort/dashboard">Accéder à mon dashboard</Link>
          </Button>
        )}

        {(user.role === "ADMIN" || user.role === "MODERATOR") && (
          <Button asChild className="w-full">
            <Link href="/admin">Administration</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
