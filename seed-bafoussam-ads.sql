-- ============================================================
-- Seed démo : compte ESCORT "Bafoussam" + 5 annonces à BAFOUSSAM (ville)
--
-- À lancer dans Supabase SQL Editor.
-- Identifiants démo :
--   Email     : bafoussam@affinité.com
--   Téléphone : 237677888999
--   Mot de passe : Bafoussam@2026
--
-- Photos hébergées dans public/escorts/bafoussam/
--
-- Idempotent : si les annonces existent déjà (anciennement à Yaoundé),
-- elles seront mises à jour pour pointer vers Bafoussam.
-- ============================================================

-- 1) Compte User (rôle ESCORT)
INSERT INTO "User" (
  "id", "name", "email", "phone", "password",
  "role", "isBanned", "emailVerified", "phoneVerified",
  "createdAt", "updatedAt"
)
VALUES (
  'usr_bafoussam_demo',
  'Bafoussam',
  'bafoussam@affinité.com',
  '237677888999',
  '$2a$10$TCAuwgdIBHwLGspxz24dEuG0ebFXo9TmVjgNGSApacSx.eW4n4KCW',
  'ESCORT',
  false,
  NOW(),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET "password" = EXCLUDED."password";

-- 2) EscortProfile lié
INSERT INTO "EscortProfile" (
  "id", "userId", "displayName", "slug",
  "age", "gender", "isVerified", "verification",
  "createdAt", "updatedAt"
)
VALUES (
  'prof_bafoussam_demo',
  'usr_bafoussam_demo',
  'Bafoussam',
  'bafoussam-demo',
  24,
  'FEMALE',
  true,
  'VERIFIED',
  NOW(),
  NOW()
)
ON CONFLICT ("userId") DO UPDATE SET "isVerified" = true, "verification" = 'VERIFIED';

-- 3) 5 annonces actives à BAFOUSSAM (UPSERT)

-- Annonce 1
WITH city AS (SELECT id FROM "City" WHERE slug = 'bafoussam')
INSERT INTO "Ad" (
  "id", "ownerId", "profileId", "cityId",
  "title", "slug", "description",
  "price", "priceNight",
  "whatsappPhone", "callPhone", "neighborhood",
  "services", "incall", "outcall",
  "status", "tier",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'ad_bafoussam_01', 'usr_bafoussam_demo', 'prof_bafoussam_demo', city.id,
  'Coquine en visite à Bafoussam — dispo Banengo & Tougang',
  'bafoussam-ad-01',
  E'Salut chéri 😘 Je suis Bafoussam, jeune femme douce et raffinée de passage à Bafoussam pour quelques jours.\n\nJe me déplace partout dans la ville : hôtel, appartement, domicile. Discrétion absolue garantie.\n\nMassage sensuel, accompagnement soirée, moments intimes — tout est possible avec moi. Disponible 24/7 pour les vrais gentlemen.\n\nWhatsApp uniquement, pas de SMS.',
  20000, 80000,
  '237677888999', NULL, 'Banengo',
  ARRAY['Massage', 'Accompagnement', 'Sortie restaurant'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM city
ON CONFLICT (id) DO UPDATE SET
  "cityId"       = EXCLUDED."cityId",
  "title"        = EXCLUDED."title",
  "slug"         = EXCLUDED."slug",
  "description"  = EXCLUDED."description",
  "neighborhood" = EXCLUDED."neighborhood",
  "updatedAt"    = NOW();

-- Annonce 2
WITH city AS (SELECT id FROM "City" WHERE slug = 'bafoussam')
INSERT INTO "Ad" (
  "id", "ownerId", "profileId", "cityId",
  "title", "slug", "description",
  "price", "priceNight",
  "whatsappPhone", "callPhone", "neighborhood",
  "services", "incall", "outcall",
  "status", "tier",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'ad_bafoussam_02', 'usr_bafoussam_demo', 'prof_bafoussam_demo', city.id,
  'Soirée brûlante à Bafoussam centre 🔥 — VIP & déplacement',
  'bafoussam-ad-02',
  E'Hello mon cœur 💋 Tu cherches une vraie compagnie pour ta soirée à Bafoussam ?\n\nJe suis là pour toi : élégante, drôle, intelligente — et terriblement sensuelle quand il le faut.\n\nDéplacement hôtel/restaurant/club, soirée privée, week-end complet... Je m''adapte à tes envies.\n\nContactez-moi sur WhatsApp pour les détails et la disponibilité.',
  25000, 100000,
  '237677888999', NULL, 'Centre-ville',
  ARRAY['Accompagnement', 'Sortie restaurant', 'Soirée privée', 'Week-end'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM city
ON CONFLICT (id) DO UPDATE SET
  "cityId"       = EXCLUDED."cityId",
  "title"        = EXCLUDED."title",
  "slug"         = EXCLUDED."slug",
  "description"  = EXCLUDED."description",
  "neighborhood" = EXCLUDED."neighborhood",
  "updatedAt"    = NOW();

-- Annonce 3
WITH city AS (SELECT id FROM "City" WHERE slug = 'bafoussam')
INSERT INTO "Ad" (
  "id", "ownerId", "profileId", "cityId",
  "title", "slug", "description",
  "price", "priceNight",
  "whatsappPhone", "callPhone", "neighborhood",
  "services", "incall", "outcall",
  "status", "tier",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'ad_bafoussam_03', 'usr_bafoussam_demo', 'prof_bafoussam_demo', city.id,
  'Belle plante dispo Bafoussam week-end — discrétion 100%',
  'bafoussam-ad-03',
  E'Bonjour à toi 🌹\n\nJe m''appelle Bafoussam, 24 ans, mensurations naturelles, douce et joueuse.\n\nJe reste à Bafoussam tout le week-end. Idéal pour un moment de détente loin du stress, dans la discrétion la plus totale.\n\nJe me déplace dans tout Bafoussam : Banengo, Tougang, Famla, Tamdja, Kamkop, Centre. Pas de tabous, juste du respect mutuel.\n\nWhatsApp pour réserver — premier arrivé, premier servi 😉',
  18000, 75000,
  '237677888999', NULL, 'Tougang',
  ARRAY['Massage', 'Domination douce', 'GFE (girlfriend experience)'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM city
ON CONFLICT (id) DO UPDATE SET
  "cityId"       = EXCLUDED."cityId",
  "title"        = EXCLUDED."title",
  "slug"         = EXCLUDED."slug",
  "description"  = EXCLUDED."description",
  "neighborhood" = EXCLUDED."neighborhood",
  "updatedAt"    = NOW();

-- Annonce 4 (PREMIUM)
WITH city AS (SELECT id FROM "City" WHERE slug = 'bafoussam')
INSERT INTO "Ad" (
  "id", "ownerId", "profileId", "cityId",
  "title", "slug", "description",
  "price", "priceNight",
  "whatsappPhone", "callPhone", "neighborhood",
  "services", "incall", "outcall",
  "status", "tier",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'ad_bafoussam_04', 'usr_bafoussam_demo', 'prof_bafoussam_demo', city.id,
  'Nuit folle à Bafoussam 💎 — VIP, je me déplace, hôtel ou domicile',
  'bafoussam-ad-04',
  E'Coucou 😘\n\nJe suis Bafoussam, escort indépendante haut de gamme, et je suis à Bafoussam pour quelques nuits seulement.\n\nPour les gentlemen qui aiment le luxe et la qualité : je propose des moments inoubliables, en toute discrétion, à ton hôtel ou ton domicile.\n\nTarif nuit complète : 100 000 FCFA. Heure : 25 000 FCFA. Réservation 1h à l''avance impérative.\n\nWhatsApp uniquement. Numéros masqués ignorés.',
  25000, 100000,
  '237677888999', NULL, 'Famla',
  ARRAY['VIP', 'Accompagnement haut de gamme', 'Nuit complète', 'Hôtel'],
  true, true,
  'ACTIVE', 'PREMIUM',
  NOW(), NOW(), NOW()
FROM city
ON CONFLICT (id) DO UPDATE SET
  "cityId"       = EXCLUDED."cityId",
  "title"        = EXCLUDED."title",
  "slug"         = EXCLUDED."slug",
  "description"  = EXCLUDED."description",
  "neighborhood" = EXCLUDED."neighborhood",
  "tier"         = EXCLUDED."tier",
  "updatedAt"    = NOW();

UPDATE "Ad" SET "promotedUntil" = NOW() + INTERVAL '30 days' WHERE id = 'ad_bafoussam_04';

-- Annonce 5
WITH city AS (SELECT id FROM "City" WHERE slug = 'bafoussam')
INSERT INTO "Ad" (
  "id", "ownerId", "profileId", "cityId",
  "title", "slug", "description",
  "price", "priceNight",
  "whatsappPhone", "callPhone", "neighborhood",
  "services", "incall", "outcall",
  "status", "tier",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'ad_bafoussam_05', 'usr_bafoussam_demo', 'prof_bafoussam_demo', city.id,
  'Câline et sensuelle à Bafoussam — déplacements rapides 24/7',
  'bafoussam-ad-05',
  E'Hey toi 💕\n\nJe suis dispo aujourd''hui et tous les jours pour de vrais moments à Bafoussam.\n\nDouce, attentive, à l''écoute — je suis l''escort idéale si tu veux te détendre après une longue journée. Massage, câlins, complicité...\n\nDéplacement rapide partout dans Bafoussam en moins de 30 min. Je viens à toi.\n\nPaiement cash à l''arrivée. Contactez-moi sur WhatsApp pour ma localisation actuelle.',
  15000, 60000,
  '237677888999', NULL, 'Tamdja',
  ARRAY['Massage', 'GFE (girlfriend experience)', 'Déplacement express'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM city
ON CONFLICT (id) DO UPDATE SET
  "cityId"       = EXCLUDED."cityId",
  "title"        = EXCLUDED."title",
  "slug"         = EXCLUDED."slug",
  "description"  = EXCLUDED."description",
  "neighborhood" = EXCLUDED."neighborhood",
  "updatedAt"    = NOW();

-- 4) Photos (1 par annonce, isPrimary=true)
INSERT INTO "Media" ("id", "adId", "url", "type", "isPrimary", "isApproved", "position", "createdAt")
VALUES
  ('med_baf_01', 'ad_bafoussam_01', '/escorts/bafoussam/01.jpeg', 'PHOTO', true, true, 0, NOW()),
  ('med_baf_02', 'ad_bafoussam_02', '/escorts/bafoussam/02.jpeg', 'PHOTO', true, true, 0, NOW()),
  ('med_baf_03', 'ad_bafoussam_03', '/escorts/bafoussam/03.jpeg', 'PHOTO', true, true, 0, NOW()),
  ('med_baf_04', 'ad_bafoussam_04', '/escorts/bafoussam/04.jpeg', 'PHOTO', true, true, 0, NOW()),
  ('med_baf_05', 'ad_bafoussam_05', '/escorts/bafoussam/05.jpeg', 'PHOTO', true, true, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
-- SELECT a.id, a.title, a.tier, a.status, a.neighborhood, c.name AS city
-- FROM "Ad" a
-- JOIN "City" c ON c.id = a."cityId"
-- WHERE a."ownerId" = 'usr_bafoussam_demo'
-- ORDER BY a.id;
--
-- → doit retourner 5 lignes, toutes "Bafoussam"
