import { prisma } from "@/lib/prisma";

/**
 * Lit une valeur numérique dans SiteSetting.
 * Si la clé n'existe pas ou n'est pas un nombre, retourne `fallback`.
 */
export async function getSettingNumber(key: string, fallback: number): Promise<number> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  if (!setting) return fallback;
  const n = Number(setting.value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Lit une valeur string dans SiteSetting.
 * Si la clé n'existe pas, retourne `fallback`.
 */
export async function getSettingString(key: string, fallback: string): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? fallback;
}
