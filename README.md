# TaxiTrack - Plateforme de VTC Moderne

TaxiTrack est une solution complète de gestion de services VTC et Taxi. Le projet combine un backend robuste, une application mobile hybride pour les clients et chauffeurs, et un tableau de bord d'administration web.

## 🐳 Déploiement Simplifié avec Docker (Recommandé)

Le projet inclut une configuration Docker qui permet de lancer toute la plateforme (Backend, Base de données et Dashboard Admin) sans avoir à installer Node.js ou PostgreSQL manuellement sur votre machine.

### 1. Pourquoi utiliser Docker ?
Docker crée des "conteneurs" qui contiennent tout ce dont votre application a besoin pour fonctionner. Cela évite les erreurs du type "ça marche sur ma machine mais pas sur la tienne" et simplifie énormément l'installation.

### 2. Installation (Pour débutants)
Si vous n'avez jamais utilisé Docker :
1.  **Téléchargez Docker Desktop** : Allez sur [docker.com](https://www.docker.com/products/docker-desktop/) et téléchargez la version pour Windows ou Mac.
2.  **Installez-le** : Suivez les instructions classiques d'installation.
3.  **Lancez Docker** : Une fois installé, ouvrez l'application Docker Desktop et attendez que l'icône de la baleine en bas à gauche devienne verte/stable.

### 3. Lancer TaxiTrack en un clic
Une fois Docker prêt :
1.  Ouvrez un terminal à la racine du projet TaxiTrack.
2.  Tapez la commande suivante :
    ```bash
    docker-compose up --build
    ```
3.  **C'est tout !** Docker va télécharger les images nécessaires, configurer la base de données et lancer les serveurs.

### 4. Initialisation de la base de données
La toute première fois que vous lancez le projet, vous devez créer les tables. Laissez Docker tourner et ouvrez un **deuxième** terminal pour taper :
```bash
# Entrer dans le serveur backend pour créer les tables
docker exec -it taxitrack_backend npm run db:migrate
# Ajouter des données de test (optionnel)
docker exec -it taxitrack_backend npm run db:seed
```

### 5. Accès aux interfaces
*   **Tableau de bord Admin** : Ouvrez [http://localhost:80](http://localhost:80)
*   **Documentation API (Swagger)** : [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
*   **API Backend** : [http://localhost:5000/api](http://localhost:5000/api)

### 6. Et l'application Mobile ?
L'application mobile n'est pas dans Docker car elle doit s'exécuter sur un téléphone (ou un émulateur). Une fois que vos conteneurs Docker tournent :
1. Allez dans le dossier `mobile-app`.
2. Lancez `flutter run -d emulator-[nom_de_votre_premier_emulateur]` destiné au chauffeur.
3. Lancer dans un autre terminal `flutter run -d emulator-[nom_de_votre_deuxieme_emulateur]` destiné au client.

---

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

## 🚀 Installation Manuelle (Sans Docker)

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
# Assurez-vous d'avoir un émulateur ou appareil connecté
flutter run
```

---

## 📡 Flux de Communication
*   **API REST** : Communication standard entre les frontends et le backend.
*   **WebSockets** : Mises à jour en temps réel des positions GPS et statuts des courses.
*   **RBAC** : Système de rôles strict (Admin, Driver, Client) sécurisant chaque point d'accès.

## 📄 Licence
Ce projet est propriétaire. Tous droits réservés.
