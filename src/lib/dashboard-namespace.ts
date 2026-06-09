import type { Role } from "@prisma/client";

/**
 * URL externe vers le dashboard utilisateur (hébergé dans le projet yamo-dashboard).
 * Configurable via NEXT_PUBLIC_DASHBOARD_URL ; à défaut, https://dashboard.affiniter.cm.
 */
function getDashboardExternalUrl(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.affiniter.cm";
}

/**
 * Retourne l'URL ou le namespace de destination selon le rôle :
 *   - ADMIN / MODERATOR → "/admin" (interne, hébergé dans ce projet)
 *   - ESCORT            → URL externe `dashboard.affiniter.cm/escort/dashboard`
 *   - CLIENT            → URL externe `dashboard.affiniter.cm/client`
 *
 * Les sessions Auth.js sont partagées entre affiniter.cm et dashboard.affiniter.cm
 * via le même `AUTH_SECRET` et un cookie sur le domaine racine `.affiniter.cm`.
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
