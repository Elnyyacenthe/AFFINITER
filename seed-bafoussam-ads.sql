-- ============================================================
-- Seed démo : compte ESCORT "Bafoussam" + 5 annonces à Yaoundé
--
-- À lancer dans Supabase SQL Editor.
-- Identifiants démo (à utiliser pour se connecter) :
--   Email     : bafoussam@affiniter.cm
--   Téléphone : 237677888999
--   Mot de passe : Bafoussam@2026
--
-- Photos hébergées dans public/escorts/bafoussam/
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
  'bafoussam@affiniter.cm',
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

-- 3) 5 annonces actives à Yaoundé
-- Toutes pointent vers la même cityId (resolvée via slug 'yaounde')

-- Annonce 1
WITH yaounde AS (SELECT id FROM "City" WHERE slug = 'yaounde')
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
  'ad_bafoussam_01', 'usr_bafoussam_demo', 'prof_bafoussam_demo', yaounde.id,
  'Coquine en visite à Yaoundé — dispo Bastos & Mvan',
  'bafoussam-yaounde-01',
  E'Salut chéri 😘 Je suis Bafoussam, jeune femme douce et raffinée de passage à Yaoundé pour quelques jours.\n\nJe me déplace partout : hôtel, appartement, domicile. Discrétion absolue garantie.\n\nMassage sensuel, accompagnement soirée, moments intimes — tout est possible avec moi. Disponible 24/7 pour les vrais gentlemen.\n\nWhatsApp uniquement, pas de SMS.',
  20000, 80000,
  '237677888999', NULL, 'Bastos',
  ARRAY['Massage', 'Accompagnement', 'Sortie restaurant'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM yaounde
ON CONFLICT (id) DO NOTHING;

-- Annonce 2
WITH yaounde AS (SELECT id FROM "City" WHERE slug = 'yaounde')
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
  'ad_bafoussam_02', 'usr_bafoussam_demo', 'prof_bafoussam_demo', yaounde.id,
  'Soirée brûlante à Yaoundé centre 🔥 — VIP & déplacement',
  'bafoussam-yaounde-02',
  E'Hello mon cœur 💋 Tu cherches une vraie compagnie pour ta soirée à Yaoundé ?\n\nJe suis là pour toi : élégante, drôle, intelligente — et terriblement sensuelle quand il le faut.\n\nDéplacement hôtel/restaurant/club, soirée privée, week-end complet... Je m''adapte à tes envies.\n\nContactez-moi sur WhatsApp pour les détails et la disponibilité.',
  25000, 100000,
  '237677888999', NULL, 'Centre-ville',
  ARRAY['Accompagnement', 'Sortie restaurant', 'Soirée privée', 'Week-end'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM yaounde
ON CONFLICT (id) DO NOTHING;

-- Annonce 3
WITH yaounde AS (SELECT id FROM "City" WHERE slug = 'yaounde')
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
  'ad_bafoussam_03', 'usr_bafoussam_demo', 'prof_bafoussam_demo', yaounde.id,
  'Belle plante dispo Yaoundé week-end — discrétion 100%',
  'bafoussam-yaounde-03',
  E'Bonjour à toi 🌹\n\nJe m''appelle Bafoussam, 24 ans, mensurations naturelles, douce et joueuse.\n\nJe reste à Yaoundé tout le week-end. Idéal pour un moment de détente loin du stress, dans la discrétion la plus totale.\n\nJe me déplace dans tout Yaoundé : Bastos, Bonas, Nlongkak, Tsinga, Mvan, Centre. Pas de tabous, juste du respect mutuel.\n\nWhatsApp pour réserver — premier arrivé, premier servi 😉',
  18000, 75000,
  '237677888999', NULL, 'Nlongkak',
  ARRAY['Massage', 'Domination douce', 'GFE (girlfriend experience)'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM yaounde
ON CONFLICT (id) DO NOTHING;

-- Annonce 4
WITH yaounde AS (SELECT id FROM "City" WHERE slug = 'yaounde')
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
  'ad_bafoussam_04', 'usr_bafoussam_demo', 'prof_bafoussam_demo', yaounde.id,
  'Nuit folle à Yaoundé 💎 — VIP, je me déplace, hôtel ou domicile',
  'bafoussam-yaounde-04',
  E'Coucou 😘\n\nJe suis Bafoussam, escort indépendante haut de gamme, et je suis à Yaoundé pour quelques nuits seulement.\n\nPour les gentlemen qui aiment le luxe et la qualité : je propose des moments inoubliables, en toute discrétion, à ton hôtel ou ton domicile.\n\nTarif nuit complète : 100 000 FCFA. Heure : 25 000 FCFA. Réservation 1h à l''avance impérative.\n\nWhatsApp uniquement. Numéros masqués ignorés.',
  25000, 100000,
  '237677888999', NULL, 'Bastos',
  ARRAY['VIP', 'Accompagnement haut de gamme', 'Nuit complète', 'Hôtel'],
  true, true,
  'ACTIVE', 'PREMIUM',
  NOW(), NOW(), NOW()
FROM yaounde
ON CONFLICT (id) DO NOTHING;

UPDATE "Ad" SET "promotedUntil" = NOW() + INTERVAL '30 days' WHERE id = 'ad_bafoussam_04';

-- Annonce 5
WITH yaounde AS (SELECT id FROM "City" WHERE slug = 'yaounde')
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
  'ad_bafoussam_05', 'usr_bafoussam_demo', 'prof_bafoussam_demo', yaounde.id,
  'Câline et sensuelle à Yaoundé — déplacements rapides 24/7',
  'bafoussam-yaounde-05',
  E'Hey toi 💕\n\nJe suis dispo aujourd''hui et tous les jours pour de vrais moments à Yaoundé.\n\nDouce, attentive, à l''écoute — je suis l''escort idéale si tu veux te détendre après une longue journée. Massage, câlins, complicité...\n\nDéplacement rapide partout dans Yaoundé en moins de 30 min. Je viens à toi.\n\nPaiement cash à l''arrivée. Contactez-moi sur WhatsApp pour ma localisation actuelle.',
  15000, 60000,
  '237677888999', NULL, 'Mvan',
  ARRAY['Massage', 'GFE (girlfriend experience)', 'Déplacement express'],
  true, true,
  'ACTIVE', 'STANDARD',
  NOW(), NOW(), NOW()
FROM yaounde
ON CONFLICT (id) DO NOTHING;

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
-- SELECT a.id, a.title, a.tier, a.status, c.name AS city
-- FROM "Ad" a
-- JOIN "City" c ON c.id = a."cityId"
-- WHERE a."ownerId" = 'usr_bafoussam_demo';
--
-- → doit retourner 5 lignes, toutes "Yaoundé"
