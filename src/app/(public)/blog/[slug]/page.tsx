import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, User as UserIcon } from "lucide-react";

import { BLOG_POSTS, getPostBySlug, getAllSlugs } from "@/content/blog/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME, SITE_URL } from "@/lib/utils";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article introuvable", robots: { index: false } };
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    keywords: post.meta.keywords,
    alternates: { canonical: `/blog/${post.meta.slug}` },
    authors: [{ name: post.meta.author }],
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt,
      url: `${SITE_URL}/blog/${post.meta.slug}`,
      type: "article",
      publishedTime: post.meta.publishedAt,
      modifiedTime: post.meta.updatedAt ?? post.meta.publishedAt,
      authors: [post.meta.author],
      tags: post.meta.keywords,
      images: [{ url: post.meta.cover }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.excerpt,
      images: [post.meta.cover],
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const ArticleContent = post.content;

  // JSON-LD : BlogPosting + BreadcrumbList
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: `${SITE_URL}${post.meta.cover}`,
    datePublished: post.meta.publishedAt,
    dateModified: post.meta.updatedAt ?? post.meta.publishedAt,
    author: { "@type": "Organization", name: post.meta.author, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.meta.slug}` },
    keywords: post.meta.keywords.join(", "),
    articleSection: post.meta.category,
    wordCount: 1500,
    inLanguage: "fr-FR",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.meta.title, item: `${SITE_URL}/blog/${post.meta.slug}` },
    ],
  };

  // Related posts (autres articles, même catégorie en priorité, max 3)
  const related = BLOG_POSTS.filter((p) => p.meta.slug !== post.meta.slug)
    .sort((a, b) => (b.meta.category === post.meta.category ? 1 : 0) - (a.meta.category === post.meta.category ? 1 : 0))
    .slice(0, 3);

  return (
    <article className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">›</span>
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{post.meta.title}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <Badge variant="secondary" className="mb-3">{post.meta.category}</Badge>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          {post.meta.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" /> {post.meta.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(post.meta.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {post.meta.readingMinutes} min de lecture
          </span>
        </div>
      </header>

      <div className="relative mb-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-xl bg-secondary">
        <Image
          src={post.meta.cover}
          alt={post.meta.title}
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-invert mx-auto max-w-3xl text-base leading-relaxed [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_p]:mt-4 [&_p]:text-foreground/90 [&_p.lead]:text-lg [&_p.lead]:text-muted-foreground [&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_li]:text-foreground/90 [&_strong]:text-foreground [&_table]:border [&_table]:border-border/40 [&_th]:px-3 [&_th]:py-1 [&_td]:px-3 [&_td]:py-1 [&_em]:italic">
        <ArticleContent />
      </div>

      {/* CTA fin d'article */}
      <Card className="mx-auto mt-12 max-w-3xl border-primary/30 bg-primary/5">
        <CardContent className="space-y-3 p-6 text-center">
          <h2 className="font-display text-2xl font-bold">
            Prêt à passer à l'action ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Découvrez les escortes vérifiées disponibles près de chez vous.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/recherche">Parcourir les annonces</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/villes">Choisir une ville</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 font-display text-2xl font-bold">À lire ensuite</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.meta.slug} href={`/blog/${r.meta.slug}`} className="group">
                <Card className="h-full overflow-hidden border-border/40 transition hover:border-primary/60">
                  <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                    <Image src={r.meta.cover} alt={r.meta.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-[10px]">{r.meta.category}</Badge>
                    <p className="line-clamp-2 text-sm font-bold">{r.meta.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
