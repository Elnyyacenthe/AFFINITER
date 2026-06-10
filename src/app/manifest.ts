import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Plateforme N°1 d'annonces d'escorts et ndolo au Cameroun. Profils vérifiés 18+.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0014",
    theme_color: "#ff3d8b",
    orientation: "portrait",
    lang: "fr",
    categories: ["lifestyle", "social", "dating"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
