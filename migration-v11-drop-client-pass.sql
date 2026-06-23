-- ============================================================
-- Migration v11 : Suppression du modèle client-payant
--
-- Contexte (2026-06-11) : revirement business
--   - Les CLIENTS ne paient plus rien (contact WhatsApp gratuit)
--   - Plus de Pass Premium Client (1000 FCFA/mois)
--   - Plus de pay-per-reveal (1000 FCFA / contact)
--   - Seules les ESCORTES paient désormais (abonnement mensuel + options)
--
-- À appliquer dans Supabase SQL Editor APRÈS déploiement du code v3.
-- ============================================================

-- 1. Drop des colonnes Pass Premium Client sur User
ALTER TABLE "User" DROP COLUMN IF EXISTS "clientPassUntil";
ALTER TABLE "User" DROP COLUMN IF EXISTS "dailyRevealsCount";
ALTER TABLE "User" DROP COLUMN IF EXISTS "dailyRevealsResetAt";

-- 2. Drop de la table NumberReveal (plus de tracking par paiement)
DROP TABLE IF EXISTS "NumberReveal" CASCADE;

-- 3. Cleanup SiteSetting du modèle ancien
DELETE FROM "SiteSetting" WHERE "key" IN (
  'pricing.reveal.amount',
  'pricing.clientpass.amount',
  'pricing.clientpass.days',
  'clientpass.reveals.daily.anon',
  'clientpass.reveals.daily.free',
  'clientpass.reveals.daily.premium'
);

-- 4. Annuler les Payments PENDING de type REVEAL / CLIENT_PASS (s'il en reste)
UPDATE "Payment"
   SET "status" = 'FAILED'
 WHERE "status" = 'PENDING'
   AND "intent" IS NOT NULL
   AND ("intent"->>'type' IN ('REVEAL', 'CLIENT_PASS'));

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name LIKE '%clientPass%' OR column_name LIKE '%daily%';
-- → doit retourner 0 ligne

-- SELECT count(*) FROM "Payment" WHERE "intent"->>'type' IN ('REVEAL','CLIENT_PASS') AND status='PENDING';
-- → doit retourner 0
