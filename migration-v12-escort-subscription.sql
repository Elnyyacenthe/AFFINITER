-- ============================================================
-- Migration v12 : Abonnement mensuel escort (Standard/Premium/VIP)
--
-- Contexte : seules les escortes paient désormais. 3 tiers d'abonnement :
--   - STANDARD : 2 000 FCFA/mois (1 annonce, 3 photos)
--   - PREMIUM  : 5 000 FCFA/mois (3 annonces, 10 photos, mise en avant ville)
--   - VIP      : 15 000 FCFA/mois (illimité, top homepage, badge VIP)
--
-- Une escorte SANS abonnement actif ne peut PAS publier d'annonce.
-- Une escorte avec abonnement EXPIRÉ voit ses annonces passer en PAUSED.
-- ============================================================

-- 1. Enum tier d'abonnement
DO $$ BEGIN
  CREATE TYPE "EscortSubscriptionTier" AS ENUM ('NONE', 'STANDARD', 'PREMIUM', 'VIP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Colonnes sur User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "escortSubscriptionTier"  "EscortSubscriptionTier" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "escortSubscriptionUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "escortSubscriptionAutoRenew" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "User_escortSubscriptionUntil_idx"
  ON "User" ("escortSubscriptionUntil");

-- 3. Pricing par tier (modifiable par admin via /admin/tarifs)
INSERT INTO "SiteSetting" ("key", "value", "category", "updatedAt") VALUES
  ('pricing.escortSubscription.standard.amount', '2000',  'pricing', NOW()),
  ('pricing.escortSubscription.premium.amount',  '5000',  'pricing', NOW()),
  ('pricing.escortSubscription.vip.amount',      '15000', 'pricing', NOW()),
  ('pricing.escortSubscription.days',            '30',    'pricing', NOW()),
  ('escortSubscription.cap.standard.ads',        '1',     'limits',  NOW()),
  ('escortSubscription.cap.premium.ads',         '3',     'limits',  NOW()),
  ('escortSubscription.cap.vip.ads',             '999',   'limits',  NOW()),
  ('escortSubscription.cap.standard.photos',     '3',     'limits',  NOW()),
  ('escortSubscription.cap.premium.photos',      '10',    'limits',  NOW()),
  ('escortSubscription.cap.vip.photos',          '50',    'limits',  NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name LIKE 'escortSubscription%';
