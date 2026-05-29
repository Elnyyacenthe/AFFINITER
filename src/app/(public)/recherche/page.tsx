import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { searchAds } from "@/lib/actions/ads";
import { adFilterSchema } from "@/lib/validations/ad";
import { AdGrid } from "@/components/ads/ad-grid";
import { SearchFilters } from "@/components/ads/search-filters";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Recherche d'annonces",
  description: "Filtrez et trouvez les annonces qui vous correspondent.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }

  const filter = adFilterSchema.parse(flat);
  const [{ items, total, page, pages }, cities] = await Promise.all([
    searchAds(filter),
    prisma.city.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams(flat as Record<string, string>);
    sp.set("page", String(p));
    return `/recherche?${sp.toString()}`;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">
        Recherche <span className="gradient-text">avancée</span>
      </h1>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside>
          <SearchFilters cities={cities} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} annonce{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
            </p>
          </div>

          <AdGrid ads={items} />

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageUrl(page - 1)}>← Précédent</Link>
                </Button>
              )}
              <span className="px-3 text-sm">
                Page {page} / {pages}
              </span>
              {page < pages && (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageUrl(page + 1)}>Suivant →</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
