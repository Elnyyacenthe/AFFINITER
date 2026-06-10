import type { ReactNode } from "react";

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: "Sécurité" | "Guide ville" | "Tarifs" | "Culture" | "Annonceur" | "Pratique";
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  cover: string; // /blog/xxx.jpg ou url
  keywords: string[];
  author: string;
}

export interface BlogPost {
  meta: BlogPostMeta;
  content: () => ReactNode;
}

import { post as p1 } from "./posts/regles-or-securite-escort-cameroun";
import { post as p2 } from "./posts/top-quartiers-douala";
import { post as p3 } from "./posts/prix-escort-cameroun-2026";
import { post as p4 } from "./posts/ndolo-cameroun-culture";
import { post as p5 } from "./posts/annonce-escort-qui-convertit";

export const BLOG_POSTS: BlogPost[] = [p1, p2, p3, p4, p5];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.meta.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.meta.slug);
}
