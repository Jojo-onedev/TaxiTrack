# TaxiTrack - Application Mobile (Flutter)

## Rôle du Module
L'application mobile TaxiTrack est une application hybride unique gérant deux interfaces distinctes (Client et Chauffeur) via un système de rôles (RBAC) basé sur un token JWT.

## Spécifications Techniques

- **Framework** : Flutter
- **Gestion d'État** : BLoC (Business Logic Component)
- **Cartographie** : Mapbox (Navigation et Géolocalisation)
- **Temps Réel** : Firebase Cloud Messaging (FCM) + WebSockets (Socket.io)
- **Couleurs** : 
  - Principal : `#6686B2`
  - Nuances : Adaptées selon le rôle (Clair/Expert).

## Architecture du Code (`/lib`)
- `core/` : Thèmes, configurations API, constantes et utilitaires.
- `shared/` : Widgets réutilisables (boutons, inputs) basés sur la charte graphique.
- `features/` :
    - `auth/` : Gestion de la connexion, inscription (client) et session persistante.
    - `client/` : Recherche de destination, commande, suivi temps réel et historique client.
    - `driver/` : Gestion de disponibilité (On/Off), liste des courses, et historique chauffeur.
    - `notifications/` : Gestion centralisée des notifications push et flux temps réel.

## Cycle de Vie d'une Course
1. **SEARCHING** : Le client commande, le backend cherche un chauffeur.
2. **DRIVER_ACCEPTED** : Un chauffeur accepte la course (verrouillage immédiat).
3. **CLIENT_CONFIRMED** : Le client valide définitivement le choix du chauffeur.
4. **ARRIVED** : Le chauffeur est sur place.
5. **IN_PROGRESS** : Trajet en cours.
6. **COMPLETED** : Fin de course et feedback.

## Navigation (Bottom Navigation Bar)
- **Client** : Accueil (Service), Historique, Notifications. Profil en haut à droite.
- **Chauffeur** : Tableau de bord (Disponibilité), Mes Courses, Historique, Notifications (avec badge).
