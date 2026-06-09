-- ============================================================
-- Migration v8 : Refonte paiements — K-Pay direct one-shot (suppression wallet user)
--
-- Architecture v2 :
--   - Plus de wallet utilisateur
--   - Chaque action payante (Bump, Sticky, Premium, etc.) → paiement K-Pay direct
--   - Le Payment porte un "intent" qui décrit l'action à appliquer après succès
--   - Quand K-Pay confirme (polling ou pg_cron), on applique l'intent
-- ============================================================

-- 1. Ajoute l'intent au Payment
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "intent"        JSONB,
  ADD COLUMN IF NOT EXISTS "intentApplied" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "intentAppliedAt" TIMESTAMP(3);

-- Index pour le pg_cron reconcile (find pending payments to reconcile fast)
CREATE INDEX IF NOT EXISTS "Payment_status_intentApplied_createdAt_idx"
  ON "Payment" ("status", "intentApplied", "createdAt");

-- 2. Drop colonne walletBalance plus tard (après migration code) — pour l'instant on la garde
-- pour ne pas tout casser. Cette migration sera dans v9 quand tout sera switché.
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "walletBalance";

-- 3. Drop WithdrawalRequest user-facing — REPORTÉ aussi.
-- Pour l'instant on transforme juste les colonnes pour distinguer admin vs user.
ALTER TABLE "WithdrawalRequest"
  ADD COLUMN IF NOT EXISTS "isPlatformPayout" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN "WithdrawalRequest"."isPlatformPayout"
  IS 'true = retrait des fonds plateforme par admin. false = ancien retrait user (déprécié)';

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'Payment' AND column_name IN ('intent', 'intentApplied', 'intentAppliedAt');
