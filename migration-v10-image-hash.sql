-- ============================================================
-- Migration v10 : pHash sur Media pour détection des photos doublons
--
-- Stratégie :
--   - Chaque Media (photo) reçoit un fingerprint perceptuel 64-bit (pHash)
--     stocké en hex (16 chars). Calculé via sharp côté Node.
--   - Avant qu'une nouvelle annonce / photo service soit publiée, on cherche
--     les pHash proches (Hamming distance ≤ 5) → si match → refus.
--   - Index sur imageHash pour des lookups O(1) sur les hashes exacts.
--     Le matching approximatif (Hamming distance) se fait en Node après un
--     pre-fetch limité (pas de DB-side bitcount pour rester portable).
-- ============================================================

ALTER TABLE "Media"
  ADD COLUMN IF NOT EXISTS "imageHash" TEXT;

-- Index pour les lookups exacts (cas le plus fréquent)
CREATE INDEX IF NOT EXISTS "Media_imageHash_idx" ON "Media" ("imageHash");

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'Media' AND column_name = 'imageHash';
