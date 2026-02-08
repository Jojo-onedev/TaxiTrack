# 🏗️ TaxiTrack Backend - Architecture Technique

**Version** : 1.0.0  
**Date** : Février 2026

---

## 📊 Vue d'ensemble

TaxiTrack est une application backend complète pour gérer un service de taxi moderne avec :
- **API REST** pour les opérations CRUD
- **WebSocket** pour les mises à jour temps réel
- **Authentification JWT** multi-rôles
- **Base de données PostgreSQL** relationnelle

---

## 🎯 Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   App Web    │  │  App Mobile  │  │   Dashboard  │         │
│  │   (Client)   │  │  (Chauffeur) │  │   (Admin)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │  HTTP/REST       │  HTTP/REST       │  HTTP/REST
          │  WebSocket       │  WebSocket       │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────────┐
│                     BACKEND SERVER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Express.js + Socket.io                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Routes    │  │ Controllers │  │ Middleware  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WebSocket Manager (Socket.io)                │  │
│  │  • Rooms (user_{id}, drivers, clients)                    │  │
│  │  • Événements temps réel                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                     PostgreSQL Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    users     │  │     cars     │  │    rides     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │client_profiles│ │driver_profiles│ │ maintenance  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de base de données

### Tables et relations

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ • id (PK)       │
│ • email         │
│ • password_hash │
│ • role          │◄─────────┐
│ • created_at    │          │
└────────┬────────┘          │
         │                    │
         │ 1:1                │ 1:1
         │                    │
    ┌────▼─────────┐   ┌──────▼──────────┐
    │client_profiles│   │driver_profiles  │
    ├──────────────┤   ├─────────────────┤
    │• user_id (FK)│   │• user_id (FK)   │
    │• nom         │   │• nom            │
    │• prenom      │   │• prenom         │
    │• telephone   │   │• telephone      │
    │• lieu_residence│ │• lieu_residence │
    └──────┬───────┘   │• availability   │
           │           │• current_lat    │
           │           │• current_long   │
           │           │• car_id (FK)    │────┐
           │           └────┬────────────┘    │
           │ 1:N            │ 1:N             │ N:1
           │                │                 │
    ┌──────▼────────────────▼──────┐   ┌─────▼──────┐
    │         rides                │   │   cars     │
    ├──────────────────────────────┤   ├────────────┤
    │ • id (PK)                    │   │• id (PK)   │
    │ • client_id (FK) → users     │   │• nom_modele│
    │ • driver_id (FK) → users     │   │• plaque    │
    │ • depart_lat, depart_long    │   │• type      │
    │ • dest_lat, dest_long        │   │• couleur   │
    │ • depart_address             │   │• annee     │
    │ • dest_address               │   │• kilometrage│
    │ • status                     │   │• status    │
    │ • prix                       │   └─────┬──────┘
    │ • created_at                 │         │
    │ • updated_at                 │         │ 1:N
    └──────────────────────────────┘         │
                                      ┌──────▼──────┐
                                      │ maintenance │
                                      ├─────────────┤
                                      │• id (PK)    │
                                      │• car_id (FK)│
                                      │• type       │
                                      │• description│
                                      │• cout       │
                                      │• date       │
                                      └─────────────┘
```

---

## 📁 Structure des fichiers

```
taxitrack-backend/
│
├── src/                          # Code source principal
│   │
│   ├── config/                   # Configuration
│   │   ├── database.js           # Pool PostgreSQL
│   │   └── socket.js             # Configuration Socket.io
│   │
│   ├── middleware/               # Middlewares Express
│   │   └── auth.js               # JWT authentication & authorization
│   │
│   ├── controllers/              # Logique métier
│   │   ├── authController.js     # Inscription, connexion, profil
│   │   ├── clientController.js   # Demandes de courses, historique
│   │   ├── driverController.js   # Accepter courses, mettre à jour statut
│   │   └── adminController.js    # CRUD chauffeurs, véhicules, stats
│   │
│   ├── routes/                   # Définition des routes
│   │   ├── authRoutes.js         # POST /register, /login, PATCH /profile
│   │   ├── clientRoutes.js       # /rides/request, /rides/active, /rides/history
│   │   ├── driverRoutes.js       # /rides/available, /rides/:id/accept
│   │   └── adminRoutes.js        # /stats/*, /drivers, /cars, /clients
│   │
│   └── server.js                 # Point d'entrée (Express + Socket.io)
│
├── database/                     # Scripts base de données
│   └── init_db.js                # Création tables, index, contraintes
│
├── create_admin.js               # Script création compte admin
├── test-socket.html              # Page de test WebSocket
│
├── .env                          # Variables d'environnement (non versionné)
├── .env.example                  # Exemple de configuration
├── .gitignore                    # Fichiers à ignorer
├── package.json                  # Dépendances npm
│
└── docs/                         # Documentation
    ├── API_DOCUMENTATION.md      # Documentation API complète
    ├── INSTALLATION.md           # Guide d'installation
    └── ARCHITECTURE.md           # Ce fichier
```

---

## 🔐 Système d'authentification

### Flow d'inscription

```
┌────────┐         POST /api/auth/register        ┌──────────┐
│ Client │────────────────────────────────────────>│  Server  │
└────────┘       {email, password, role, ...}      └─────┬────┘
                                                         │
                                                         │ 1. Valider données
                                                         │
                                                         │ 2. Hasher password
                                                         │    bcrypt.hash()
                                                         │
                                                         ▼
                                                  ┌──────────┐
                                                  │PostgreSQL│
                                                  └─────┬────┘
                                                        │
                                                        │ 3. INSERT users
                                                        │ 4. INSERT client/driver_profiles
                                                        │
                                                        ▼
┌────────┐         {user, token}                 ┌──────────┐
│ Client │◄────────────────────────────────────── │  Server  │
└────────┘                                        └──────────┘
                 5. Générer JWT
                 6. Retourner token
```

### Flow de connexion

```
┌────────┐         POST /api/auth/login          ┌──────────┐
│ Client │────────────────────────────────────────>│  Server  │
└────────┘       {email, password}                └─────┬────┘
                                                        │
                                                        │ 1. SELECT user
                                                        │    WHERE email = ?
                                                        ▼
                                                  ┌──────────┐
                                                  │PostgreSQL│
                                                  └─────┬────┘
                                                        │
                                                        │ 2. bcrypt.compare()
                                                        │    password vs hash
                                                        │
                                                        ▼
┌────────┐         {user, token}                 ┌──────────┐
│ Client │◄────────────────────────────────────── │  Server  │
└────────┘                                        └──────────┘
                 3. Générer JWT
                 4. Retourner token
```

### Middleware d'authentification

```javascript
// 1. Extraire le token du header Authorization
const token = req.headers.authorization?.split(' ')[1];

// 2. Vérifier et décoder le JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. Ajouter les infos utilisateur à req
req.user = {
  id: decoded.id,
  email: decoded.email,
  role: decoded.role
};

// 4. Passer au prochain middleware/contrôleur
next();
```

### Middleware d'autorisation

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }
    next();
  };
};

// Usage
router.get('/admin/stats', authenticate, authorize('admin'), getStats);
```

---

## 🔌 Architecture WebSocket

### Initialisation

```javascript
// server.js
const http = require('http');
const server = http.createServer(app);
const io = initializeSocket(server);

// Rendre io accessible dans toutes les routes
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});
```

### Authentification Socket.io

```javascript
// src/config/socket.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Token manquant'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Token invalide'));
  }
});
```

### Système de Rooms

À la connexion, chaque utilisateur rejoint automatiquement :

```javascript
io.on('connection', (socket) => {
  // Room personnelle
  socket.join(`user_${socket.userId}`);
  
  // Room par rôle
  if (socket.userRole === 'driver') {
    socket.join('drivers');
  } else if (socket.userRole === 'client') {
    socket.join('clients');
  }
  
  console.log(`User ${socket.userId} (${socket.userRole}) connecté`);
});
```

### Flux de notifications

```
NOUVELLE COURSE
───────────────

Client                     Server                    Chauffeurs
  │                          │                           │
  │  POST /rides/request     │                           │
  ├─────────────────────────>│                           │
  │                          │                           │
  │                          │ 1. INSERT INTO rides      │
  │                          │                           │
  │  {ride created}          │                           │
  │◄─────────────────────────┤                           │
  │                          │                           │
  │                          │ 2. io.to('drivers').emit  │
  │                          │    'new_ride_request'     │
  │                          ├──────────────────────────>│
  │                          │                           │
  │                          │                     [Notification]


ACCEPTATION COURSE
──────────────────

Chauffeur                  Server                     Client
  │                          │                           │
  │  POST /rides/42/accept   │                           │
  ├─────────────────────────>│                           │
  │                          │                           │
  │                          │ 1. UPDATE rides           │
  │                          │    SET driver_id          │
  │                          │                           │
  │  {ride accepted}         │                           │
  │◄─────────────────────────┤                           │
  │                          │                           │
  │                          │ 2. io.to('user_${client}')│
  │                          │    .emit('ride_accepted') │
  │                          ├──────────────────────────>│
  │                          │                           │
  │                          │                     [Notification
  │                          │                      chauffeur trouvé]


POSITION GPS
────────────

Chauffeur                  Server                     Client
  │                          │                           │
  │ socket.emit('update_     │                           │
  │   location', {lat,lng})  │                           │
  ├─────────────────────────>│                           │
  │                          │                           │
  │                          │ 1. UPDATE driver_profiles │
  │                          │    SET current_lat/long   │
  │                          │                           │
  │                          │ 2. SELECT active ride     │
  │                          │                           │
  │                          │ 3. io.to('user_${client}')│
  │                          │    .emit('driver_position')│
  │                          ├──────────────────────────>│
  │                          │                           │
  │                          │              [Mise à jour position
  │                          │               sur la carte]
```

---

## 🎯 Flow d'une course complète

### 1. Demande de course (Client)

```
POST /api/client/rides/request
├─ Authentification JWT
├─ Vérifier aucune course en cours
├─ Calculer distance et prix
├─ INSERT INTO rides (status='pending')
├─ Émettre WebSocket: 'new_ride_request' → tous les chauffeurs
└─ Retourner {ride}
```

### 2. Acceptation (Chauffeur)

```
POST /api/driver/rides/42/accept
├─ Authentification JWT
├─ Vérifier chauffeur disponible
├─ Vérifier course au statut 'pending'
├─ UPDATE rides SET driver_id, status='accepted'
├─ Émettre WebSocket: 'ride_accepted' → client concerné
└─ Retourner {ride}
```

### 3. Mise à jour GPS (Chauffeur)

```
WebSocket: 'update_location' {lat, lng}
├─ Vérifier role = 'driver'
├─ UPDATE driver_profiles SET current_lat, current_long
├─ SELECT ride active du chauffeur
├─ Si ride active:
│  └─ Émettre 'driver_position' → client de la ride
└─ Confirmer réception
```

### 4. Progression de la course (Chauffeur)

```
PATCH /api/driver/rides/42/status {status: 'arrived'}
├─ Authentification JWT
├─ Vérifier ownership (ride.driver_id = user.id)
├─ Valider transition de statut
├─ UPDATE rides SET status, updated_at
├─ Émettre WebSocket: 'status_changed' → client
│  └─ Message personnalisé selon statut
└─ Retourner {ride}

Statuts possibles:
  pending → accepted → arrived → in_progress → completed
                    └──────────────────────────> cancelled
```

### 5. Annulation (Client)

```
POST /api/client/rides/42/cancel
├─ Authentification JWT
├─ Vérifier ownership (ride.client_id = user.id)
├─ Vérifier statut annulable (pending ou accepted)
├─ UPDATE rides SET status='cancelled'
├─ Si driver assigné:
│  └─ Émettre WebSocket: 'ride_cancelled' → chauffeur
└─ Retourner succès
```

---

## 🔧 Composants techniques

### Configuration de la base de données

```javascript
// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                      // Nombre max de connexions
  idleTimeoutMillis: 30000,     // Timeout des connexions inactives
  connectionTimeoutMillis: 2000 // Timeout de connexion
});

// Vérifier la connexion
pool.on('connect', () => {
  console.log('✅ Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

module.exports = pool;
```

### Gestion des erreurs globale

```javascript
// src/server.js

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.details
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
  
  // Erreur générique
  res.status(500).json({
    success: false,
    message: 'Erreur serveur'
  });
});
```

---

## 🛡️ Sécurité

### Mesures implémentées

1. **Hashage des mots de passe**
   - Algorithme : bcrypt avec salt de 10 rounds
   - Jamais de mots de passe en clair en BDD

2. **JWT sécurisés**
   - Secret fort et aléatoire
   - Expiration configurée (7 jours par défaut)
   - Stockage côté client (localStorage/cookies)

3. **Validation des données**
   - express-validator sur tous les endpoints
   - Validation des types, formats, longueurs
   - Protection injection SQL (requêtes paramétrées)

4. **Autorisation par rôle**
   - Middleware `authorize()` sur endpoints sensibles
   - Vérification rôle dans JWT
   - Séparation stricte client/driver/admin

5. **CORS configuré**
   - Liste blanche de domaines autorisés
   - Headers autorisés limités
   - Credentials activés pour JWT

### Recommandations production

1. **HTTPS obligatoire**
   - Toutes les communications chiffrées
   - Certificats SSL/TLS valides

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // 100 requêtes max
   });
   
   app.use('/api/auth/login', limiter);
   ```

3. **Helmet.js**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

4. **Variables d'environnement**
   - Jamais de secrets dans le code
   - Utiliser des gestionnaires de secrets (AWS Secrets, Vault)

5. **Logs sécurisés**
   - Ne jamais logger de mots de passe
   - Ne jamais logger de tokens complets
   - Utiliser Winston ou Morgan

---

## 📈 Performance et scalabilité

### Optimisations actuelles

1. **Index de base de données**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_rides_client ON rides(client_id);
   CREATE INDEX idx_rides_driver ON rides(driver_id);
   CREATE INDEX idx_rides_status ON rides(status);
   ```

2. **Pool de connexions PostgreSQL**
   - Réutilisation des connexions
   - Max 20 connexions simultanées
   - Timeout configuré

3. **Requêtes optimisées**
   - SELECT seulement les colonnes nécessaires
   - JOIN au lieu de requêtes multiples
   - LIMIT sur les listes

### Recommandations pour scaling

1. **Cache Redis**
   ```javascript
   // Cacher les données fréquentes
   - Sessions utilisateurs
   - Liste des courses actives
   - Statistiques dashboard
   ```

2. **Load Balancer**
   ```
   ┌──────────┐
   │  Nginx   │
   │Load Balancer│
   └────┬─────┘
        │
    ┌───┴───┐
    │       │
   ▼       ▼
   API1    API2
   ```

3. **Database Replication**
   ```
   Master (Write) → Slave 1 (Read)
                 → Slave 2 (Read)
   ```

4. **CDN pour assets statiques**
   - Images profils
   - Icônes véhicules
   - Fichiers statiques

---

## 🧪 Tests

### Types de tests recommandés

1. **Tests unitaires** (Jest)
   ```javascript
   describe('authController.register', () => {
     it('devrait créer un utilisateur valide', async () => {
       // Test
     });
   });
   ```

2. **Tests d'intégration** (Supertest)
   ```javascript
   describe('POST /api/auth/login', () => {
     it('devrait retourner un token valide', async () => {
       const res = await request(app)
         .post('/api/auth/login')
         .send({ email: 'test@example.com', password: 'pass' });
       
       expect(res.status).toBe(200);
       expect(res.body.data.token).toBeDefined();
     });
   });
   ```

3. **Tests WebSocket** (Socket.io-client)
   ```javascript
   const io = require('socket.io-client');
   
   it('devrait recevoir new_ride_request', (done) => {
     const socket = io('http://localhost:5000', {
       auth: { token: driverToken }
     });
     
     socket.on('new_ride_request', (data) => {
       expect(data.ride_id).toBeDefined();
       done();
     });
   });
   ```

---

## 📊 Monitoring

### Métriques à surveiller

1. **Serveur**
   - CPU usage
   - Mémoire RAM
   - Nombre de connexions actives

2. **Base de données**
   - Temps de réponse des requêtes
   - Nombre de connexions
   - Taille de la base

3. **API**
   - Requêtes par seconde
   - Temps de réponse moyen
   - Taux d'erreur

4. **WebSocket**
   - Connexions actives
   - Messages par seconde
   - Latence

### Outils recommandés

- **PM2** : Process manager avec monitoring
- **Prometheus + Grafana** : Métriques et dashboards
- **Sentry** : Tracking des erreurs
- **Winston** : Logs structurés

---

## 🔄 Workflow de développement

```
┌─────────────┐
│ Développeur │
└──────┬──────┘
       │
       │ 1. git checkout -b feature/xxx
       │
       ▼
  Développement
       │
       │ 2. npm run dev (tests locaux)
       │
       ▼
  ┌─────────┐
  │   Git   │
  └────┬────┘
       │
       │ 3. git commit & push
       │
       ▼
  ┌────────┐
  │ GitHub │
  └────┬───┘
       │
       │ 4. Pull Request
       │
       ▼
  ┌──────────┐
  │Code Review│
  └────┬─────┘
       │
       │ 5. Tests automatisés (CI)
       │
       ▼
  ┌────────┐
  │ Merge  │
  └────┬───┘
       │
       │ 6. Déploiement auto (CD)
       │
       ▼
  ┌──────────┐
  │Production│
  └──────────┘
```

---

## 📚 Ressources

### Documentation externe

- **Express.js** : https://expressjs.com/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Socket.io** : https://socket.io/docs/
- **JWT** : https://jwt.io/introduction
- **bcrypt** : https://github.com/kelektiv/node.bcrypt.js

### Bonnes pratiques

- **REST API Design** : https://restfulapi.net/
- **Node.js Best Practices** : https://github.com/goldbergyoni/nodebestpractices
- **PostgreSQL Performance** : https://wiki.postgresql.org/wiki/Performance_Optimization

---

**Version** : 1.0.0  
**Dernière mise à jour** : 8 février 2026  
**Auteur** : TaxiTrack Team