import FavoritesPage from "@/components/dashboards/favorites-page";

export default async function ClientFavoritesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return <FavoritesPage backUrl="/client/favoris" searchParams={sp} />;
}
