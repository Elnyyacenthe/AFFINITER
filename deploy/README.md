# `deploy/` — Infrastructure de production

Fichiers d'infrastructure versionnés pour ne **plus** être perdus lors d'un `git clean -fdx` ou d'un redéploiement complet. Cette protection a été ajoutée après l'incident du 25 juin 2026 où un `git clean -fdx` a effacé `run-cron.sh` et `ecosystem.config.js` (les 6 crons K-Pay/business sont restés cassés jusqu'à reconstruction manuelle).

## Contenu du dossier

| Fichier | Destination sur le serveur | Rôle |
|---|---|---|
| `cron.d-affiniter` | `/etc/cron.d/affiniter` | Planning des 7 crons (reconcile K-Pay, abonnements escortes, boosts, etc.) |

Les autres fichiers d'infra (à la **racine** du repo) :

| Fichier | Rôle |
|---|---|
| `ecosystem.config.js` | Config PM2 (process `affiniter`, port 3000, max 1G RAM, autorestart) |
| `run-cron.sh` | Dispatcher HTTP `/api/cron/*` avec auth `Authorization: Bearer ${CRON_SECRET}` |

## Installation initiale (nouveau serveur)

```bash
cd /var/www/affiniter

# 1. Copier le fichier cron dans /etc/cron.d/ (Git ne peut pas le faire automatiquement,
#    /etc/ est hors du repo)
sudo cp deploy/cron.d-affiniter /etc/cron.d/affiniter
sudo chown root:root /etc/cron.d/affiniter
sudo chmod 644 /etc/cron.d/affiniter
sudo systemctl reload cron 2>/dev/null || sudo service cron reload

# 2. PM2 — chargement de la config + autostart
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # suivre les instructions affichées

# 3. Vérifier que run-cron.sh est bien exécutable (Git track le bit +x)
ls -la run-cron.sh   # doit afficher -rwxr-xr-x
```

## Mise à jour après modification du planning cron

Le fichier `/etc/cron.d/affiniter` n'est **pas** automatiquement mis à jour par `git reset --hard`. Après chaque modification de `deploy/cron.d-affiniter` :

```bash
sudo cp /var/www/affiniter/deploy/cron.d-affiniter /etc/cron.d/affiniter
sudo systemctl reload cron 2>/dev/null || sudo service cron reload
```

## Règle secrets

**Aucun secret hardcodé** dans les fichiers de ce dossier (et de la racine `ecosystem.config.js` / `run-cron.sh`).

- `CRON_SECRET` → lu depuis `.env` au runtime par `run-cron.sh` (via `grep`)
- `DATABASE_URL`, `KPAY_*`, `AUTH_SECRET` → lus depuis `.env` par Next.js et PM2

Si tu ajoutes une nouvelle variable d'env, **NE PAS** la mettre dans `ecosystem.config.js` ni dans `run-cron.sh` — toujours dans `.env` (gitignored).

## Pourquoi `/etc/cron.d/` plutôt que `crontab -u`

- **Versionnable** : `/etc/cron.d/*` est un fichier texte qui peut vivre dans Git, `crontab -u` ne l'est pas
- **Ownership root** : convention pour les crons de service (vs cron user-level)
- **Lisibilité** : un fichier plat avec commentaires plutôt qu'une config user éphémère
- **Auditabilité** : un `cat /etc/cron.d/affiniter` suffit à savoir ce qui tourne

## Smoke tests des crons

Manuellement depuis le shell pour vérifier que l'auth + endpoint fonctionnent (chaque réponse doit être un JSON `{"ok": true, ...}`) :

```bash
cd /var/www/affiniter

./run-cron.sh expire-boosts          # → {"ok":true,"expired":N}
./run-cron.sh reconcile-payments     # → {"ok":true,"reconciled":N}
./run-cron.sh escort-subscriptions   # → {"ok":true,"notified":N,"expired":N}
```

Si l'un retourne `HTTP 401` → vérifier que `CRON_SECRET` dans `.env` matche celui que les routes attendent.
Si l'un retourne `HTTP 500` → consulter `pm2 logs affiniter --lines 100`.

## Planning des 7 crons (résumé)

| Cron | Fréquence | Heure | Rôle |
|---|---|---|---|
| `reconcile-payments` | toutes les 5 min | — | Récup PENDING K-Pay → PAID/FAILED + apply intents |
| `expire-boosts` | chaque heure | `0 *` | Expire les boosts STICKY / PROMOTED arrivés à terme |
| `auto-renew` | chaque heure | `15 *` | Re-prélève K-Pay pour abonnements escort `autoRenew=true` |
| `escort-subscriptions` | quotidien | `7h30` | Notif J-3 + désactivation publication à l'expiration |
| `notify-expiring` | quotidien | `8h00` | Notif J-3 expiration annonces |
| `suggest-upgrade` | quotidien | `8h30` | Suggestion tier upgrade aux escortes qui plafonnent |
| `revenue-alert` | quotidien | `9h00` | Notif admin avec CA du jour précédent |
