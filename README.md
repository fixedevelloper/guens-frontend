# GuenTours — Frontend

Application Next.js (App Router) qui consomme l'API `guentours-api` (Spring Boot) pour la
recherche et la réservation de vols/hôtels multi-fournisseurs (Travelopro, Sabre, Travelport).

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TanStack Query** pour la récupération/mise en cache des données serveur
- **Axios** comme client HTTP (instance centralisée avec intercepteurs JWT + normalisation
  des erreurs sur `lib/api/client.ts`)
- **shadcn/ui** (composants écrits directement dans `src/components/ui`, style "new-york",
  thème neutre + accent indigo, tokens clair/sombre dans `globals.css`)
- **next-intl** pour l'internationalisation (français par défaut sans préfixe d'URL, anglais
  sous `/en`)
- **react-hook-form + zod** pour tous les formulaires
- **Server-Sent Events** natifs (`EventSource`) pour le suivi temps réel d'une réservation

## Démarrer en local

```bash
cp .env.local.example .env.local   # ajuster NEXT_PUBLIC_API_URL si besoin
npm install
npm run dev
```

Le backend (`guentours-api`) doit tourner sur le port indiqué par `NEXT_PUBLIC_API_URL`
(`http://localhost:8080` par défaut). CORS est déjà ouvert côté backend pour le développement.

## Structure

```
src/
  app/[locale]/            Pages (App Router, une locale par segment)
    page.tsx               Accueil : onglets recherche vol / hôtel
    flights/, hotels/      Résultats de recherche + comparatif des fournisseurs
    checkout/              Coordonnées + voyageurs, avant paiement
    payment/[bookingId]/   Formulaire de carte
    bookings/[bookingId]/  Suivi temps réel (SSE) + billets électroniques + annulation
    login/, register/      Authentification
  components/
    ui/                    Composants shadcn (écrits à la main, voir note ci-dessous)
    search/, checkout/, tracking/   Composants métier par domaine
  hooks/                   Hooks TanStack Query par ressource (search, booking, payment, tickets)
  lib/api/                 Types + fonctions d'appel HTTP, un fichier par contrôleur backend
  context/auth-context.tsx JWT + profil utilisateur (localStorage)
  i18n/                    Config next-intl (routing, navigation, request)
messages/                  Traductions fr.json / en.json
```

## Note sur shadcn/ui

Le CLI `shadcn` fait un appel réseau vers `ui.shadcn.com` qui n'était pas joignable dans cet
environnement ; les composants ont donc été écrits directement dans `src/components/ui`
(c'est de toute façon la philosophie de shadcn : le code vous appartient, il n'y a pas de
dépendance npm à mettre à jour). Pour ajouter un nouveau composant plus tard là où le CLI est
disponible : `npx shadcn@latest add <composant>`, en gardant le thème `components.json` déjà
en place.

## Vérification

- `npm run build` — build de production (typecheck inclus)
- `npx eslint src` — lint (4 warnings connus et documentés dans `eslint.config.mjs`, liés à
  des patterns d'hydratation SSR-safe volontaires)
- Le parcours complet (recherche → sélection → checkout → paiement → suivi en direct → billet)
  a été validé de bout en bout avec un navigateur réel contre un backend local en mode mock.
