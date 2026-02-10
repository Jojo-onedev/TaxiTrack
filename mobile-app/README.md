# TaxiTrack - Application Mobile (Flutter)

TaxiTrack est une application mobile moderne de VTC/Taxi construite avec Flutter. Elle offre une expérience fluide pour les clients et les chauffeurs grâce à une interface unique gérée par un système de rôles (RBAC).

## 🚀 Fonctionnalités Principales

### Pour les Clients
- **Demande de course** : Recherche de destination via Photon et sélection sur carte.
- **Suivi en temps réel** : Visualisation de la position du chauffeur sur la carte.
- **Historique** : Accès complet aux trajets passés et aux factures.
- **Notifications** : Alertes instantanées sur le statut de la course.

### Pour les Chauffeurs
- **Gestion de disponibilité** : Basculement en ligne/hors ligne.
- **Réception de courses** : Notifications push pour les nouvelles demandes à proximité.
- **Navigation** : Guidage intégré via OpenStreetMap.
- **Tableau de bord** : Statistiques de gains et résumé des activités.

## 🛠 Spécifications Techniques

- **Framework** : Flutter (>= 3.10.7)
- **Gestion d'État** : BLoC (Business Logic Component)
- **Cartographie** : OpenStreetMap via `flutter_map`
- **Géocodage** : Photon API
- **Networking** : Dio (HTTP) & Socket.io (Temps réel)
- **Injection de Dépendances** : GetIt
- **Stockage Sécurisé** : Flutter Secure Storage (Tokens JWT)

## 📦 Installation et Configuration

### Prérequis
- Flutter SDK installé
- Un émulateur Android (recommandé) ou iOS
- Le backend TaxiTrack en cours d'exécution sur le port 5000

### Installation
1. Clonez le dépôt et naviguez vers le dossier :
   ```bash
   cd mobile-app
   ```
2. Installez les dépendances :
   ```bash
   flutter pub get
   ```

### Configuration de l'API
Par défaut, l'application est configurée pour pointer vers `http://10.0.2.2:5000/api` (adresse standard pour l'émulateur Android vers la machine hôte).

Pour modifier l'adresse du serveur, éditez le fichier :
`lib/core/http_service.dart`

```dart
static const String baseUrl = 'http://VOTRE_IP:5000/api';
```

### Lancement
Pour lancer l'application en mode debug :
```bash
flutter run
```

## 🏗 Architecture du Projet (`/lib`)

- `core/` : Services de base (Auth, Location, Http, Theme, Service Locator).
- `features/` : Modules fonctionnels découpés par domaine.
    - `auth/` : Login, Inscription, Splash screen.
    - `client/` : Recherche, Map, Demande de course, Historique client.
    - `driver/` : Dashboard chauffeur, Gestion des trajets, Historique.
    - `ride/` : Logique partagée des courses (BLoC implémentation).
- `shared/` : Composants UI réutilisables et constantes.

## 📄 Licence
Ce projet est propriétaire. Tous droits réservés.
