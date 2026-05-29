import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CityCard } from "@/components/ads/city-card";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Toutes les villes",
  description: "Découvrez les annonces d'escorts dans toutes les villes du Cameroun.",
};

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: [{ isPopular: "desc" }, { order: "asc" }],
    include: { _count: { select: { ads: { where: { status: "ACTIVE" } } } } },
  });

  return (
    <div className="container py-10">
      <h1 className="font-display text-4xl font-bold">Toutes les villes</h1>
      <p className="mt-2 text-muted-foreground">
        Explorez les annonces dans {cities.length} villes du Cameroun
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cities.map((c, idx) => (
          <CityCard
            key={c.id}
            index={idx}
            city={{ name: c.name, slug: c.slug, imageUrl: c.imageUrl, adCount: c._count.ads }}
          />
        ))}
      </div>
    </div>
  );
}
