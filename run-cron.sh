#!/bin/bash
# ============================================================================
# Affiniter — dispatcher des crons appelé par /etc/cron.d/affiniter.
#
# Usage  : ./run-cron.sh <endpoint>
# Endpoints valides :
#   reconcile-payments     — toutes les 5 min (K-Pay PAID/FAILED rapprochement)
#   expire-boosts          — chaque heure
#   auto-renew             — chaque heure (abonnements escortes auto-renew)
#   escort-subscriptions   — quotidien 7h30 (notif J-3 + désactivation expiration)
#   notify-expiring        — quotidien 8h (annonces qui expirent)
#   suggest-upgrade        — quotidien 8h30 (suggestion tier upgrade)
#   revenue-alert          — quotidien 9h (alerte revenus admin)
#
# Sécurité : CRON_SECRET est lu depuis .env au runtime (jamais hardcodé).
# Le script échoue avec un message clair si CRON_SECRET est manquant.
# ============================================================================

set -euo pipefail

APP_DIR="/var/www/affiniter"
APP_URL="http://127.0.0.1:3000"

ENDPOINT="${1:-}"
if [ -z "$ENDPOINT" ]; then
  echo "Usage: $0 <endpoint>" >&2
  echo "Endpoints: reconcile-payments expire-boosts auto-renew escort-subscriptions notify-expiring suggest-upgrade revenue-alert" >&2
  exit 1
fi

# Lit CRON_SECRET depuis .env (format clé="valeur" ou clé=valeur)
if [ ! -f "${APP_DIR}/.env" ]; then
  echo "ERREUR: ${APP_DIR}/.env introuvable" >&2
  exit 2
fi

CRON_SECRET=$(grep -E '^CRON_SECRET=' "${APP_DIR}/.env" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
if [ -z "${CRON_SECRET:-}" ]; then
  echo "ERREUR: CRON_SECRET vide ou absent dans ${APP_DIR}/.env" >&2
  exit 3
fi

# Appel HTTP local — fail si HTTP != 2xx
curl -fsS \
  --max-time 60 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "User-Agent: affiniter-cron/1.0" \
  "${APP_URL}/api/cron/${ENDPOINT}"
echo
