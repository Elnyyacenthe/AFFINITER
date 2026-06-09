-- ============================================================
-- Migration v7 : pg_cron de réconciliation paiements (toutes les 5 min)
--
-- ⚠️  AVANT EXÉCUTION, remplacez DEUX VALEURS dans la fonction ci-dessous :
--     - YOUR_DOMAIN     → ex : https://affiniter.cm  (ou votre URL Vercel)
--     - YOUR_CRON_SECRET → la valeur de votre env var CRON_SECRET
--
-- Pourquoi pg_cron côté Supabase :
--   - Filet de sécurité indépendant de Vercel (si Vercel cron rate)
--   - Latence ultra-basse (le DB tape l'API directement)
--   - Gratuit (inclus dans Supabase)
--
-- Combiné avec :
--   - Vercel cron (vercel.json) → backup #1
--   - Polling client (5s pendant que l'onglet est ouvert) → primaire
-- ============================================================

-- 1. Activer les extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Fonction wrapper qui appelle l'endpoint Next.js
--    ⚠️ REMPLACEZ les 2 valeurs ci-dessous AVANT d'exécuter ce bloc !
CREATE OR REPLACE FUNCTION public.trigger_yamo_reconcile()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- 👇👇👇 REMPLACER ICI 👇👇👇
  v_url    text := 'YOUR_DOMAIN/api/cron/reconcile-payments';
  v_secret text := 'YOUR_CRON_SECRET';
  -- 👆👆👆 REMPLACER ICI 👆👆👆
  v_req_id bigint;
BEGIN
  SELECT net.http_get(
    url := v_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_secret,
      'Content-Type',  'application/json'
    ),
    timeout_milliseconds := 30000
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$$;

-- 3. Désinscrit l'ancien job s'il existe (rend ce script ré-exécutable)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'yamo-reconcile-5min') THEN
    PERFORM cron.unschedule('yamo-reconcile-5min');
  END IF;
END $$;

-- 4. Planifie le job toutes les 5 min
SELECT cron.schedule(
  'yamo-reconcile-5min',
  '*/5 * * * *',
  $$SELECT public.trigger_yamo_reconcile();$$
);

-- ============================================================
-- VÉRIFICATIONS (à lancer après pour valider)
-- ============================================================

-- Lister tous les jobs planifiés :
--   SELECT jobid, jobname, schedule, active FROM cron.job;

-- Voir les 10 derniers runs :
--   SELECT runid, jobid, start_time, end_time, status, return_message
--   FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'yamo-reconcile-5min')
--   ORDER BY start_time DESC LIMIT 10;

-- Voir les réponses HTTP reçues de l'API Affiniter :
--   SELECT id, status_code, content::text, created
--   FROM net._http_response
--   ORDER BY created DESC LIMIT 10;

-- Forcer un run manuel pour tester sans attendre 5 min :
--   SELECT public.trigger_yamo_reconcile();
--   -- puis attendre 3s et regarder net._http_response

-- ============================================================
-- POUR DÉSACTIVER (si besoin)
-- ============================================================
--   SELECT cron.unschedule('yamo-reconcile-5min');

-- ============================================================
-- POUR METTRE À JOUR L'URL OU LE SECRET PLUS TARD
-- ============================================================
-- Il suffit de re-créer la fonction avec les nouvelles valeurs :
--   CREATE OR REPLACE FUNCTION public.trigger_yamo_reconcile() ... (avec nouvelles valeurs)
-- Pas besoin de re-planifier le cron, il appellera la nouvelle version.
