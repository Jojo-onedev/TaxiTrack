---
noteId: "c105d3f0053b11f189695376c24dd689"
tags: []

---

# 🚀 TaxiTrack Backend - Guide d'Installation

**Version** : 1.0.0  
**Date** : Février 2026

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Logiciels requis

- **Node.js** : Version 16.x ou supérieure
  ```bash
  node --version  # Doit afficher v16.0.0 ou plus
  ```

- **npm** : Version 8.x ou supérieure (inclus avec Node.js)
  ```bash
  npm --version
  ```

- **PostgreSQL** : Version 13.x ou supérieure
  ```bash
  psql --version  # Doit afficher 13.0 ou plus
  ```

- **Git** (optionnel, pour cloner le projet)
  ```bash
  git --version
  ```

---

## 📥 Installation

### Étape 1 : Récupérer le projet

**Option A : Cloner depuis Git**
```bash
git clone https://github.com/votre-repo/taxitrack-backend.git
cd taxitrack-backend
```

**Option B : Télécharger l'archive**
```bash
unzip taxitrack-backend.zip
cd taxitrack-backend
```

---

### Étape 2 : Installer les dépendances

```bash
npm install
```

**Packages installés** :
- `express` : Framework web
- `pg` : Client PostgreSQL
- `bcryptjs` : Hashage des mots de passe
- `jsonwebtoken` : Authentification JWT
- `express-validator` : Validation des données
- `socket.io` : WebSocket temps réel
- `dotenv` : Variables d'environnement
- `cors` : Gestion CORS
- `nodemon` : Redémarrage auto (dev)

---

### Étape 3 : Configurer PostgreSQL

#### 3.1 Créer l'utilisateur de la base de données

```bash
sudo -u postgres psql
```

Dans `psql` :
```sql
-- Créer l'utilisateur
CREATE USER taxitrack_user WITH PASSWORD 'taxitrack_password';

-- Créer la base de données
CREATE DATABASE taxitrack_db OWNER taxitrack_user;

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE taxitrack_db TO taxitrack_user;

-- Quitter
\q
```

#### 3.2 Vérifier la connexion

```bash
psql -U taxitrack_user -d taxitrack_db -h localhost
# Entrer le mot de passe : taxitrack_password
```

Si ça fonctionne, tapez `\q` pour quitter.

---

### Étape 4 : Configurer les variables d'environnement

#### 4.1 Créer le fichier `.env`

```bash
cp .env.example .env
```

Ou créez manuellement le fichier `.env` à la racine du projet :

```bash
nano .env
```

#### 4.2 Remplir les variables

```dotenv
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taxitrack_db
DB_USER=taxitrack_user
DB_PASSWORD=taxitrack_password

# JWT Secret (CHANGEZ-MOI en production !)
JWT_SECRET=votre_secret_jwt_ultra_securise_a_changer_absolument
JWT_EXPIRES_IN=7d

# CORS (Frontend autorisés)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**⚠️ IMPORTANT** :
- Changez `JWT_SECRET` par une valeur aléatoire longue et complexe
- Ne commitez JAMAIS le fichier `.env` sur Git
- Ajoutez `.env` dans votre `.gitignore`

#### 4.3 Générer un JWT_SECRET sécurisé

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans `JWT_SECRET`.

---

### Étape 5 : Initialiser la base de données

#### 5.1 Créer les tables

```bash
node database/init_db.js
```

**Ce script crée** :
- Table `users` (utilisateurs)
- Table `client_profiles` (profils clients)
- Table `driver_profiles` (profils chauffeurs)
- Table `cars` (véhicules)
- Table `rides` (courses)
- Table `maintenance` (maintenance véhicules)
- Tous les index et contraintes

**Sortie attendue** :
```
✅ Base de données initialisée avec succès !
📊 Tables créées :
   - users
   - client_profiles
   - driver_profiles
   - cars
   - rides
   - maintenance
```

#### 5.2 Vérifier les tables

```bash
sudo -u postgres psql -d taxitrack_db -c "\dt"
```

Vous devriez voir :
```
           List of relations
 Schema |       Name        | Type  |      Owner      
--------+-------------------+-------+-----------------
 public | cars              | table | taxitrack_user
 public | client_profiles   | table | taxitrack_user
 public | driver_profiles   | table | taxitrack_user
 public | maintenance       | table | taxitrack_user
 public | rides             | table | taxitrack_user
 public | users             | table | taxitrack_user
```

---

### Étape 6 : Créer le compte administrateur

```bash
node create_admin.js
```

**Sortie attendue** :
```
🔐 Création du compte administrateur...

📧 Email: admin@taxitrack.com
🔑 Mot de passe: Admin123!
⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!

✅ Compte administrateur créé avec succès!
```

**Identifiants par défaut** :
- Email : `admin@taxitrack.com`
- Mot de passe : `Admin123!`

**⚠️ Changez ce mot de passe immédiatement en production !**

---

### Étape 7 : Démarrer le serveur

#### Mode développement (avec auto-restart)

```bash
npm run dev
```

#### Mode production

```bash
npm start
```

**Sortie attendue** :
```
🔌 Socket.io initialisé avec succès
================================
Serveur démarré sur le port 5000
URL: http://localhost:5000
Environnement: development
WebSocket: Actif
================================
```

---

## ✅ Vérification de l'installation

### Test 1 : Vérifier que le serveur répond

```bash
curl http://localhost:5000/api/
```

**Résultat attendu** :
```json
{
  "message": "Bienvenue sur l'API TaxiTrack",
  "version": "1.0.0",
  "status": "operational",
  "features": {
    "rest_api": true,
    "websocket": true,
    "realtime_notifications": true
  }
}
```

---

### Test 2 : Connexion admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taxitrack.com",
    "password": "Admin123!"
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@taxitrack.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Test 3 : Endpoint admin

Copiez le token de l'étape 2, puis :

```bash
curl -X GET http://localhost:5000/api/admin/stats/drivers \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_drivers": 0,
      "available_drivers": 0,
      "busy_drivers": 0,
      "drivers_with_car": 0
    },
    "top_drivers": []
  }
}
```

---

### Test 4 : WebSocket (optionnel)

Ouvrez `test-socket.html` dans un navigateur :

1. Entrez le token admin
2. Cliquez sur "Se connecter"
3. Vérifiez que le statut passe à "✅ Connecté"

---

## 🗂️ Structure du projet

```
taxitrack-backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Configuration PostgreSQL
│   │   └── socket.js          # Configuration Socket.io
│   ├── controllers/
│   │   ├── authController.js  # Authentification
│   │   ├── clientController.js # Endpoints client
│   │   ├── driverController.js # Endpoints chauffeur
│   │   └── adminController.js  # Endpoints admin
│   ├── routes/
│   │   ├── authRoutes.js      # Routes auth
│   │   ├── clientRoutes.js    # Routes client
│   │   ├── driverRoutes.js    # Routes chauffeur
│   │   └── adminRoutes.js     # Routes admin
│   ├── middleware/
│   │   └── auth.js            # Middleware JWT
│   └── server.js              # Point d'entrée
├── database/
│   └── init_db.js             # Script d'initialisation BDD
├── create_admin.js            # Script création admin
├── test-socket.html           # Page de test WebSocket
├── .env                       # Variables d'environnement (à créer)
├── .env.example               # Exemple de .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Scripts disponibles

```bash
# Démarrer en mode développement (auto-restart)
npm run dev

# Démarrer en mode production
npm start

# Initialiser/Réinitialiser la base de données
node database/init_db.js

# Créer un compte admin
node create_admin.js

# Tester la connexion à la BDD
node -e "require('./src/config/database').query('SELECT NOW()')"
```

---

## 🐛 Dépannage

### Erreur : "Cannot find module 'xxx'"

**Solution** :
```bash
npm install
```

---

### Erreur : "connection to server on socket ... failed"

**Cause** : PostgreSQL n'est pas démarré ou mal configuré.

**Solution** :
```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl status postgresql

# Vérifier que le serveur écoute
sudo -u postgres psql -c "SELECT version();"
```

---

### Erreur : "EADDRINUSE: address already in use"

**Cause** : Le port 5000 est déjà utilisé.

**Solutions** :

**Option 1** : Changer le port dans `.env`
```dotenv
PORT=5001
```

**Option 2** : Tuer le processus utilisant le port
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus (remplacer PID)
kill -9 PID
```

---

### Erreur : "password authentication failed for user"

**Cause** : Mauvais mot de passe PostgreSQL.

**Solution** :

1. Réinitialiser le mot de passe :
```bash
sudo -u postgres psql
ALTER USER taxitrack_user WITH PASSWORD 'nouveau_mot_de_passe';
\q
```

2. Mettre à jour `.env` :
```dotenv
DB_PASSWORD=nouveau_mot_de_passe
```

---

### Erreur : "JWT_SECRET is not defined"

**Cause** : Fichier `.env` manquant ou mal configuré.

**Solution** :
1. Créez le fichier `.env` (voir Étape 4)
2. Vérifiez que `JWT_SECRET` est bien défini
3. Redémarrez le serveur

---

### WebSocket ne se connecte pas

**Causes possibles** :
1. CORS mal configuré
2. Token JWT invalide

**Solution** :

Dans `src/config/socket.js`, vérifiez :
```javascript
cors: {
  origin: '*',  // En développement
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}
```

En production, remplacez `'*'` par vos domaines autorisés.

---

## 📦 Déploiement

### Préparation pour la production

1. **Variables d'environnement**
```dotenv
NODE_ENV=production
JWT_SECRET=<secret_ultra_securise_64_caracteres>
DB_HOST=<ip_ou_domaine_postgres>
ALLOWED_ORIGINS=https://votresite.com,https://app.votresite.com
```

2. **CORS Socket.io**

Dans `src/config/socket.js` :
```javascript
cors: {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  // ...
}
```

3. **HTTPS**

Utilisez un reverse proxy (Nginx, Apache) ou un service cloud avec SSL/TLS.

4. **Base de données**

- Utilisez une base PostgreSQL en production (pas localhost)
- Activez SSL pour les connexions
- Faites des backups réguliers

5. **Process Manager**

Utilisez PM2 pour gérer le serveur :
```bash
npm install -g pm2
pm2 start src/server.js --name taxitrack-api
pm2 save
pm2 startup
```

---

### Déploiement avec Docker (optionnel)

Voir le fichier `DOCKER.md` pour les instructions Docker.

---

## 📚 Prochaines étapes

1. ✅ Lire la documentation API : `API_DOCUMENTATION.md`
2. ✅ Importer la collection Postman : `TaxiTrack.postman_collection.json`
3. ✅ Tester les endpoints
4. ✅ Développer le frontend

---

## 🆘 Besoin d'aide ?

**Documentation** :
- API : `API_DOCUMENTATION.md`
- Architecture : `ARCHITECTURE.md`

**Support** :
- Issues GitHub : https://github.com/votre-repo/issues
- Email : support@taxitrack.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : 8 février 2026  
**Auteur** : TaxiTrack Team