-- ============================================================
-- Migration v9 : Cleanup post-refactor v2 (suppression du wallet utilisateur)
--
-- ⚠️ À APPLIQUER APRÈS avoir déployé le code v2.
--    Avant le déploiement, le code utilise encore User.walletBalance dans
--    les pages legacy ; après le déploiement, plus rien ne le lit.
--
-- Cette migration :
--   1. Drop User.walletBalance (le champ n'a plus aucun usage)
--   2. Drop WalletTransaction (toutes les opérations financières passent
--      désormais par Payment + intent + applyIntent)
--   3. Drop User.referredById, referralCode, referralBonusGiven (parrainage retiré)
--   4. Drop colonnes parrainage du SiteSetting
--   5. Conserve WithdrawalRequest (réservé aux retraits de fonds plateforme par admin)
-- ============================================================

-- 1. Drop walletBalance
ALTER TABLE "User" DROP COLUMN IF EXISTS "walletBalance";

-- 2. Drop WalletTransaction
DROP TABLE IF EXISTS "WalletTransaction" CASCADE;

-- 3. Drop colonnes parrainage
-- ⚠️  Si vous voulez garder les "code parrainage" pour analytics (sans bonus FCFA),
-- commentez ces lignes.
ALTER TABLE "User" DROP COLUMN IF EXISTS "referredById";
ALTER TABLE "User" DROP COLUMN IF EXISTS "referralBonusGiven";
ALTER TABLE "User" DROP COLUMN IF EXISTS "referralCode";

-- 4. Cleanup SiteSetting parrainage
DELETE FROM "SiteSetting" WHERE "key" IN (
  'referral.bonus.signup',
  'referral.bonus.payment',
  'referral.bonus.percent'
);

-- 5. WithdrawalRequest : on marque les anciens user-facing comme historique
--    (impossible à initier depuis l'UI v2, mais l'historique reste pour comptabilité)
UPDATE "WithdrawalRequest" SET "isPlatformPayout" = false WHERE "isPlatformPayout" IS NULL;

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name IN ('walletBalance', 'referralCode', 'referredById');
-- → doit retourner 0 ligne

-- SELECT * FROM information_schema.tables WHERE table_name = 'WalletTransaction';
-- → doit retourner 0 ligne
