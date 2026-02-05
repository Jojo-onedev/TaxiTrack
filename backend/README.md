# TaxiTrack Backend API

API REST pour l'application TaxiTrack - Plateforme de mise en relation entre chauffeurs VTC et clients.

## 🛠️ Technologies

- **Node.js** v18+ avec Express.js
- **PostgreSQL** (base de données relationnelle)
- **JWT** (authentification)
- **Bcrypt** (hashage des mots de passe)

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v16 ou supérieur) - [Télécharger](https://nodejs.org/)
- **PostgreSQL** (v12 ou supérieur) - [Télécharger](https://www.postgresql.org/download/)
- **npm** ou **yarn**

---

## 🚀 Installation et Configuration

### 1. Cloner le projet
```bash
git clone https://github.com/Jojo-onedev/TaxiTrack.git
cd TaxiTrack/backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du dossier `backend/` :
```bash
cp .env.example .env
```

**Si le fichier `.env.example` n'existe pas**, créez `.env` avec ce contenu :
```env
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
JWT_SECRET=mon_super_secret_jwt_a_changer_en_production_123456
JWT_EXPIRES_IN=7d

# CORS (Frontend autorisés)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

> ⚠️ **Important** : Ne versionnez JAMAIS le fichier `.env` (il doit être dans `.gitignore`)

### 4. Configuration de PostgreSQL

#### Option A : Script automatique (Recommandé)
```bash
# Assurez-vous que PostgreSQL est démarré
sudo systemctl start postgresql
sudo systemctl status postgresql

# Si le mot de passe postgres par défaut ne fonctionne pas, définissez-le :
sudo -u postgres psql
# Dans psql :
ALTER USER postgres PASSWORD 'postgres';
\q

# Lancez le script de setup
npm run db:setup
```

#### Option B : Configuration manuelle
```bash
# Connectez-vous à PostgreSQL
sudo -u postgres psql

# Créez l'utilisateur et la base de données
CREATE USER taxitrack_user WITH PASSWORD 'taxitrack_password';
CREATE DATABASE taxitrack_db;
GRANT ALL PRIVILEGES ON DATABASE taxitrack_db TO taxitrack_user;

# Connectez-vous à la base
\c taxitrack_db

# Donnez les permissions sur le schéma
GRANT ALL ON SCHEMA public TO taxitrack_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taxitrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taxitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO taxitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO taxitrack_user;

\q
```

### 5. Créer les tables (Migration)
```bash
npm run db:migrate
```

Cela créera les 6 tables nécessaires :
- `users` (utilisateurs)
- `cars` (véhicules)
- `driver_profiles` (profils chauffeurs)
- `client_profiles` (profils clients)
- `rides` (courses)
- `maintenance` (entretien)

### 6. (Optionnel) Insérer des données de test
```bash
npm run db:seed
```

Cela créera :
- 1 admin : `admin@taxitrack.com` / `password123`
- 2 chauffeurs : `driver1@taxitrack.com`, `driver2@taxitrack.com` / `password123`
- 2 clients : `client1@test.com`, `client2@test.com` / `password123`
- 2 voitures

---

## 🎯 Démarrage du serveur

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur sera accessible sur : **http://localhost:5000**

---

## 📡 Endpoints disponibles

### Authentication (`/api/auth`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/auth/register` | Inscription client | ❌ Non |
| POST | `/api/auth/login` | Connexion | ❌ Non |
| GET | `/api/auth/me` | Profil utilisateur | ✅ Oui |

### Drivers - *À venir* (`/api/drivers`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/drivers` | Créer un chauffeur | ✅ Admin |
| GET | `/api/drivers` | Liste des chauffeurs | ✅ Admin |
| GET | `/api/drivers/:id` | Détails chauffeur | ✅ Admin |
| PUT | `/api/drivers/:id` | Modifier chauffeur | ✅ Admin |
| DELETE | `/api/drivers/:id` | Supprimer chauffeur | ✅ Admin |

---

## 🧪 Tester l'API

### 1. Vérifier que le serveur fonctionne
```bash
curl http://localhost:5000
```

Ou ouvrez dans votre navigateur : http://localhost:5000

### 2. Inscription d'un nouveau client
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@test.com",
    "password": "password123",
    "nom": "Doe",
    "prenom": "John",
    "telephone": "+22670999888",
    "lieu_residence": "Ouagadougou"
  }'
```

### 3. Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client1@test.com",
    "password": "password123"
  }'
```

**Copiez le `token` retourné !**

### 4. Accéder à une route protégée
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📁 Structure du projet
```
backend/
├── database/
│   ├── migrate.js          # Création des tables
│   ├── seed.js             # Données de test
│   └── setup.js            # Configuration initiale DB
├── src/
│   ├── config/
│   │   └── database.js     # Connexion PostgreSQL
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT & Authorization
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── authRoutes.js
│   └── server.js           # Point d'entrée
├── .env                    # Variables d'environnement (NON versionné)
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Comptes de test

Si vous avez exécuté `npm run db:seed`, vous pouvez utiliser ces comptes :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@taxitrack.com | password123 | Admin |
| driver1@taxitrack.com | password123 | Chauffeur |
| driver2@taxitrack.com | password123 | Chauffeur |
| client1@test.com | password123 | Client |
| client2@test.com | password123 | Client |

---

## 🛠️ Scripts disponibles
```bash
npm start          # Démarrer le serveur (production)
npm run dev        # Démarrer avec nodemon (développement)
npm run db:setup   # Créer la base de données et l'utilisateur
npm run db:migrate # Créer les tables
npm run db:seed    # Insérer des données de test
```

---

## 🐛 Dépannage

### PostgreSQL ne démarre pas
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Démarrer au boot
sudo systemctl status postgresql
```

### Erreur "permission denied for schema public"
```bash
sudo -u postgres psql
\c taxitrack_db
GRANT ALL ON SCHEMA public TO taxitrack_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taxitrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taxitrack_user;
\q
```

### Port 5000 déjà utilisé

Modifiez `PORT` dans le fichier `.env` :
```env
PORT=5001
```

### Erreur "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port du serveur | 5000 |
| `NODE_ENV` | Environnement | development |
| `DB_HOST` | Hôte PostgreSQL | localhost |
| `DB_PORT` | Port PostgreSQL | 5432 |
| `DB_NAME` | Nom de la base | taxitrack_db |
| `DB_USER` | Utilisateur DB | taxitrack_user |
| `DB_PASSWORD` | Mot de passe DB | taxitrack_password |
| `JWT_SECRET` | Secret pour JWT | (à définir) |
| `JWT_EXPIRES_IN` | Durée validité token | 7d |
| `ALLOWED_ORIGINS` | CORS origins | http://localhost:3000 |

---

## 🤝 Contribution

1. Créez une branche : `git checkout -b feature/nouvelle-fonctionnalite`
2. Committez : `git commit -m 'Ajout de...'`
3. Pushez : `git push origin feature/nouvelle-fonctionnalite`
4. Créez une Pull Request

---

## 👥 Équipe

- **Backend** : [Votre nom]
- **Frontend** : [Nom]
- **Mobile** : [Nom]

---

## 📄 Licence

Ce projet est sous licence MIT.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2026