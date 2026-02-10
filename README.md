# TaxiTrack - Plateforme de VTC Moderne

TaxiTrack est une solution complète de gestion de services VTC et Taxi. Le projet combine un backend robuste, une application mobile hybride pour les clients et chauffeurs, et un tableau de bord d'administration web.

## 🏗️ Architecture du Projet

La plateforme est divisée en trois modules principaux :

### 1. [Backend](TaxiTrack/backend)
*   **Technologies** : Node.js, Express, PostgreSQL, Socket.io.
*   **Rôle** : API centrale, gestion des bases de données, authentification JWT, et communication temps réel pour les courses.

### 2. [Mobile App](TaxiTrack/mobile-app)
*   **Technologies** : Flutter, BLoC, OpenStreetMap.
*   **Rôle** : Interface utilisateur unique pour Clients et Chauffeurs avec basculement de mode dynamique.

### 3. [Frontend Admin](TaxiTrack/frontend-admin)
*   **Technologies** : React, Vite, CSS Vanilla.
*   **Rôle** : Management de la flotte (véhicules, chauffeurs), suivi des clients et monitoring global.

---

## 🚀 Installation Rapide

### Prérequis
*   Node.js (v18+) & npx
*   PostgreSQL
*   Flutter SDK

### 1. Configuration du Backend
```bash
cd backend
npm install
cp .env.example .env # Configurez vos accès DB
npm run db:setup     # Crée l'utilisateur et la base
npm run db:migrate   # Crée les tables
npm run db:seed      # (Optionnel) Ajoute des données de test
npm run dev
```

### 2. Configuration du Tableau de Bord (Admin)
```bash
cd frontend-admin
npm install
npm run dev
```

### 3. Configuration de l'App Mobile
```bash
cd mobile-app
flutter pub get
# Assurez-huii d'avoir un émulateur ou appareil connecté
flutter run
```

---

## 📡 Flux de Communication
*   **API REST** : Communication standard entre les frontends et le backend.
*   **WebSockets** : Mises à jour en temps réel des positions GPS et statuts des courses.
*   **RBAC** : Système de rôles strict (Admin, Driver, Client) sécurisant chaque point d'accès.

## 📄 Licence
Ce projet est propriétaire. Tous droits réservés.
