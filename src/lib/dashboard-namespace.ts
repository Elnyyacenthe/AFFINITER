import type { Role } from "@prisma/client";

/**
 * URL externe vers le dashboard utilisateur (hébergé dans le projet yamo-dashboard).
 * Configurable via NEXT_PUBLIC_DASHBOARD_URL ; à défaut, https://dashboard.yamo.cm.
 */
function getDashboardExternalUrl(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.yamo.cm";
}

/**
 * Retourne l'URL ou le namespace de destination selon le rôle :
 *   - ADMIN / MODERATOR → "/admin" (interne, hébergé dans ce projet)
 *   - ESCORT            → URL externe `dashboard.yamo.cm/escort/dashboard`
 *   - CLIENT            → URL externe `dashboard.yamo.cm/client`
 *
 * Les sessions Auth.js sont partagées entre yamo.cm et dashboard.yamo.cm
 * via le même `AUTH_SECRET` et un cookie sur le domaine racine `.yamo.cm`.
 */
export function getDashboardNamespace(role: Role): string {
  if (role === "ADMIN" || role === "MODERATOR") return "/admin";
  const base = getDashboardExternalUrl();
  if (role === "ESCORT") return `${base}/escort/dashboard`;
  return `${base}/client`;
}

/** Indique si une chaîne est une URL absolue (http[s]://…). */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
