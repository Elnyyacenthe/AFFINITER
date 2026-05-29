# Yamo — Site public + Administration

Plateforme N°1 d'annonces escorts / ndolo au Cameroun. Ce repo héberge :

| Partie | Routes | Pour qui |
|--------|--------|----------|
| **Site public** | `/`, `/recherche`, `/ville/[slug]`, `/annonce/[slug]`, `/tarifs`, `/poster-une-annonce`, légal | Tout le monde + ESCORT |
| **Authentification** | `/connexion`, `/inscription` | Tous |
| **Administration** | `/admin/*` | ADMIN + MODERATOR |

L'espace **dashboard utilisateur** (ESCORT + CLIENT) est dans un repo séparé :
👉 [github.com/Elnyyacenthe/Dashboard_YAMO](https://github.com/Elnyyacenthe/Dashboard_YAMO) (hébergé sur `dashboard.yamo.cm`)

Les sessions Auth.js sont partagées via le même `AUTH_SECRET` et un cookie sur le domaine racine `.yamo.cm`.

> ⚠️ **18+ uniquement.** Site réservé à un public adulte majeur consentant.

## ✨ Fonctionnalités

- 🔐 **Authentification** email + téléphone Cameroun (Auth.js v5) — 3 rôles : `CLIENT`, `ESCORT`, `ADMIN`, `MODERATOR`
- 📍 **15 villes** du Cameroun (Douala, Yaoundé, Bafoussam, Kribi…)
- 🔍 **Recherche avancée** : ville, prix, âge, services, vérification
- 🎯 **Annonces tiers** : Standard / Premium / VIP avec mise en avant
- 🛡️ **Modération complète** : approuver/refuser annonces et photos, badge "Vérifié"
- 📊 **Dashboards Escort & Admin** : stats vues / clics WhatsApp / revenus / signalements
- 💰 **Paiements MTN MoMo / Orange Money** (validation manuelle en place, intégration provider à venir)
- 🚩 **Signalements** : système complet client → modération admin
- 📱 **Contact WhatsApp masqué** par défaut (révélation au clic)
- 🌙 **Dark mode par défaut**, design sexy moderne avec dégradés rose magenta + ambre néon
- 🔒 **Sécurité** : rate limiting, IP hachée (RGPD), bcrypt, validation Zod, age-gate
- 🔎 **SEO** : sitemap dynamique, metadata par ville/annonce, OpenGraph, robots.txt
- ⚖️ **Légal** : mentions légales, CGU, politique de confidentialité, RGPD

## 🛠️ Stack technique

| Catégorie       | Technologie                              |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 15 (App Router) + React 19       |
| Langage         | TypeScript strict                        |
| Styles          | Tailwind CSS 3 + Shadcn/ui + Radix UI    |
| Icons           | Lucide React                             |
| Base de données | PostgreSQL + Prisma 6                    |
| Auth            | Auth.js v5 (NextAuth) + bcrypt           |
| Validation      | Zod                                      |
| Upload          | UploadThing                              |
| Toasts          | Sonner                                   |
| Thèmes          | next-themes                              |

## 📁 Architecture

```
yamo/
├── prisma/
│   ├── schema.prisma          # Schéma complet (User, Ad, EscortProfile, Media, Payment, Report…)
│   └── seed.ts                # Villes + admin + démo
├── src/
│   ├── app/
│   │   ├── (auth)/            # /connexion, /inscription
│   │   ├── (public)/          # Layout public (Header/Footer)
│   │   │   ├── page.tsx               # Home
│   │   │   ├── ville/[slug]/          # Page ville
│   │   │   ├── annonce/[slug]/        # Détail annonce
│   │   │   ├── recherche/             # Recherche avancée
│   │   │   ├── poster-une-annonce/    # Créer une annonce
│   │   │   ├── tarifs/                # Plans Premium/VIP
│   │   │   ├── compte/                # Compte utilisateur
│   │   │   ├── mentions-legales/
│   │   │   ├── cgu/
│   │   │   ├── confidentialite/
│   │   │   ├── rgpd/
│   │   │   └── contact/
│   │   ├── escort/            # Dashboard escort (auth requise)
│   │   │   ├── dashboard/
│   │   │   ├── annonces/
│   │   │   ├── profil/
│   │   │   ├── statistiques/
│   │   │   └── premium/
│   │   ├── admin/             # Dashboard admin (ADMIN/MODERATOR)
│   │   │   ├── moderation/
│   │   │   ├── annonces/
│   │   │   ├── utilisateurs/
│   │   │   ├── signalements/
│   │   │   ├── paiements/
│   │   │   ├── statistiques/
│   │   │   └── reglages/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── uploadthing/
│   │   ├── layout.tsx         # Root layout + age-gate
│   │   ├── globals.css        # Tokens couleurs + thème dark
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ui/                # Shadcn (button, card, input, dialog…)
│   │   ├── layout/            # Header, Footer, AgeGate
│   │   ├── ads/               # AdCard, AdGrid, AdForm, PhotoGallery, ContactCard…
│   │   ├── auth/              # LoginForm, RegisterForm
│   │   └── dashboard/         # SidebarNav, StatCard
│   ├── lib/
│   │   ├── actions/           # Server Actions (auth, ads, admin, reports, profile)
│   │   ├── validations/       # Schémas Zod (auth, ad)
│   │   ├── prisma.ts          # Client singleton
│   │   ├── rate-limit.ts      # Rate limit en mémoire
│   │   ├── uploadthing.ts     # Router uploads
│   │   └── utils.ts           # cn, formatXAF, slugify, maskPhone, timeAgo, hashString
│   ├── types/next-auth.d.ts
│   ├── auth.config.ts         # Config Edge (middleware)
│   ├── auth.ts                # Runtime Node (Prisma)
│   └── middleware.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js ≥ 20
- PostgreSQL 14+ (local ou Supabase / Neon / Railway)
- npm / pnpm / yarn

### 1. Installer les dépendances

```powershell
cd d:\DEV\yamo
npm install
```

### 2. Configurer les variables d'environnement

```powershell
copy .env.example .env
```

Éditer `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/yamo"
AUTH_SECRET="<générer: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
UPLOADTHING_TOKEN="<token depuis uploadthing.com>"
UPLOADTHING_SECRET="<secret depuis uploadthing.com>"
ADMIN_EMAIL="admin@yamo.cm"
ADMIN_PASSWORD="ChangeMe123!"
```

Génération du secret (Windows PowerShell) :

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
```

### 3. Préparer la base de données

```powershell
npm run prisma:generate     # Génère le client
npm run prisma:push         # Pousse le schéma (ou prisma:migrate pour versionner)
npm run prisma:seed         # Crée villes + admin + démo
```

### 4. Lancer le dev server

```powershell
npm run dev
```

Ouvrir <http://localhost:3000>.

## 🔑 Comptes de démo (après seed)

| Rôle   | Email              | Mot de passe   |
| ------ | ------------------ | -------------- |
| Admin  | admin@yamo.cm      | ChangeMe123!   |
| Escort | escort@yamo.cm     | Demo1234!      |

## 🧪 Tester chaque phase

### Phase 1 — Setup
- `npm run prisma:studio` → vérifie tables `User`, `Ad`, `City`, `Media`, `Payment`, `Report`…
- L'admin et l'escort de démo doivent être présents.

### Phase 2 — Auth
- `/inscription` → créer un client
- `/inscription?role=ESCORT` → créer un escort
- `/connexion` → connexion par email **ou** téléphone (+237 6XX XX XX XX)
- Vérifier que `/escort/*` redirige vers `/connexion` si non authentifié
- Vérifier que `/admin/*` redirige vers `/` si non admin

### Phase 3 — Pages publiques
- Home : sections VIP / Villes / Récentes
- `/ville/douala` → annonces de Douala (avec ISR 5 min)
- `/recherche?citySlug=douala&minPrice=10000` → filtres
- `/annonce/[slug]` → galerie photo + masquage WhatsApp → clic → révélation + tracking
- `/poster-une-annonce` (non connecté) → invite à se connecter

### Phase 4 — Dashboard Escort
- Login escort → `/escort/dashboard`
- Voir stats, dernières annonces
- `/escort/annonces` → liste + actions (pause/activer/supprimer)
- `/escort/profil` → édition profil
- `/escort/statistiques` → top annonces / 7 jours
- `/escort/premium` → plans

### Phase 5 — Dashboard Admin
- Login admin → `/admin`
- `/admin/moderation` → approuver / refuser / bannir annonces PENDING
- `/admin/annonces` → toutes les annonces, changement de tier
- `/admin/utilisateurs` → ban / unban, changement de rôle, vérification profil
- `/admin/signalements` → traiter signalements
- `/admin/paiements` → valider paiements PENDING
- `/admin/statistiques` → stats globales

### Phase 6 — Monétisation & légal
- `/tarifs` → comparatif des plans
- `/mentions-legales`, `/cgu`, `/confidentialite`, `/rgpd`, `/contact`
- `/robots.txt` et `/sitemap.xml` accessibles
- Age-gate au premier chargement

## 🛡️ Sécurité

- **Rate limiting** sur connexion (5/min), inscription (5/min), création d'annonces (3/h), signalements (5/min), uploads (20/min) — implémentation mémoire à remplacer par Upstash Redis en prod
- **bcrypt** 10 rounds pour les mots de passe
- **IPs hachées** SHA-256 dans `AdView` (RGPD)
- **Validation Zod** sur tous les inputs server actions
- **CSRF** géré par Auth.js
- **Middleware** protège `/admin/*`, `/escort/*`, `/poster-une-annonce`
- **Age-gate** stocké en localStorage, mur affiché au premier chargement
- **Upload restreint** : 5 Mo max, 10 photos max par annonce, modération avant publication
- **Audit log** (`AuditLog`) trace toutes les actions admin

## 🎨 Design System

- **Dark mode par défaut** (light disponible mais non promu)
- **Palette** :
  - `--primary` : Rose magenta (336° 90% 60%) — couleur d'accent principale
  - `--accent` : Ambre néon (30° 100% 55%) — boutons d'action secondaires
  - `--background` : Noir profond (240° 10% 4%)
- **Typo** : Inter (UI) + Playfair Display (titres / `font-display`)
- **Effets** :
  - `gradient-text` : Dégradé rose → ambre sur texte
  - `gradient-border` : Bordure dégradée
  - Animations `shimmer`, `glow`
  - Backdrop-blur sur header et cartes

## 💸 Intégration paiements

Le système accepte actuellement des paiements **manuels** (admin valide la transaction). Pour intégrer MTN MoMo / Orange Money en automatique :

1. Créer une route `/api/webhooks/momo` (Node runtime)
2. Vérifier la signature du provider
3. Appeler `markPaymentPaidAction(paymentId)` à la réception du webhook
4. Activer le tier sur l'annonce automatiquement

## 📋 TODO / Roadmap

- [ ] Édition d'annonce existante (UI manquante, créer un nouveau formulaire pré-rempli)
- [ ] Vérification d'identité avec upload pièce d'identité + selfie
- [ ] Intégration MTN MoMo / Orange Money via leur API officielle
- [ ] Notifications push & email transactionnel
- [ ] Système de favoris client
- [ ] Messagerie interne (chiffrée bout en bout)
- [ ] Multi-langue (anglais)
- [ ] Mode hors-ligne PWA
- [ ] Score NSFW IA sur photos (Cloudflare Workers AI ou Replicate)
- [ ] Rate limiting persistant (Upstash Redis)
- [ ] Application mobile React Native

## ⚖️ Conformité légale

- ✅ Mur d'âge (age-gate) obligatoire
- ✅ Mentions légales complètes
- ✅ CGU avec engagement "18+ uniquement"
- ✅ Politique de confidentialité conforme RGPD + loi camerounaise 2010/012
- ✅ Politique RGPD séparée
- ✅ Système de signalement immédiat
- ✅ Audit log de toutes les actions admin
- ⚠️ **À compléter avant production** : SIRET / RCCM réel, hébergeur, DPO, contrats CGU/CGV avec un avocat camerounais

## 📜 Licence

Code propriétaire. Tous droits réservés.

## 🤝 Contact

Pour toute question : <contact@yamo.cm>
