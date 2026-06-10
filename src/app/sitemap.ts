import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/utils";
import { BLOG_POSTS } from "@/content/blog/registry";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, ads] = await Promise.all([
    prisma.city.findMany({ select: { slug: true, createdAt: true } }),
    prisma.ad.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
  ]);

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), priority: 1, changeFrequency: "daily" },
    { url: `${SITE_URL}/recherche`, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/villes`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/poster-une-annonce`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/tarifs`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/mentions-legales`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${SITE_URL}/cgu`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${SITE_URL}/confidentialite`, priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...base,
    ...BLOG_POSTS.map((p) => ({
      url: `${SITE_URL}/blog/${p.meta.slug}`,
      lastModified: new Date(p.meta.updatedAt ?? p.meta.publishedAt),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    ...cities.map((c) => ({
      url: `${SITE_URL}/ville/${c.slug}`,
      lastModified: c.createdAt,
      priority: 0.8,
      changeFrequency: "daily" as const,
    })),
    ...ads.map((a) => ({
      url: `${SITE_URL}/annonce/${a.slug}`,
      lastModified: a.updatedAt,
      priority: 0.5,
      changeFrequency: "weekly" as const,
    })),
  ];
}
