import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";

import { BLOG_POSTS } from "@/content/blog/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME, SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — Conseils, guides et culture nightlife",
  description: `Tous nos articles sur la sécurité, les tarifs, les quartiers chauds du Cameroun, la culture du ndolo et les conseils pour escortes et clients. Mis à jour 2026.`,
  keywords: [
    "blog escort cameroun",
    "guide sécurité escort",
    "conseil ndolo",
    "tarif escort cameroun",
    "blog nightlife douala yaoundé",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog ${SITE_NAME} — Guides & conseils`,
    description: "Conseils, guides et culture nightlife au Cameroun.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime(),
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    ],
  };

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog ${SITE_NAME}`,
    url: `${SITE_URL}/blog`,
    description: "Conseils, guides et culture nightlife au Cameroun.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.meta.title,
      url: `${SITE_URL}/blog/${p.meta.slug}`,
      datePublished: p.meta.publishedAt,
      author: { "@type": "Organization", name: p.meta.author },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />

      <nav className="container py-3 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">Blog</span>
      </nav>

      <section className="border-b border-border/30 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Notre blog
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            Guides & <span className="gradient-text">conseils</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Sécurité, tarifs, quartiers, culture du ndolo : tout ce qu'il faut savoir pour bien
            naviguer dans les rencontres adultes au Cameroun. Mis à jour 2026.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.meta.slug} href={`/blog/${p.meta.slug}`} className="group">
              <Card className="h-full overflow-hidden border-border/40 transition hover:border-primary/60">
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                  <Image
                    src={p.meta.cover}
                    alt={p.meta.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2">
                    <Badge variant="secondary" className="text-xs">{p.meta.category}</Badge>
                  </div>
                </div>
                <CardContent className="space-y-3 p-5">
                  <h2 className="line-clamp-2 font-display text-lg font-bold leading-tight">
                    {p.meta.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{p.meta.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(p.meta.publishedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.meta.readingMinutes} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Aucun article pour le moment.
          </p>
        )}
      </section>
    </div>
  );
}
