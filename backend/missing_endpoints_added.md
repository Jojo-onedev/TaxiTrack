---
noteId: "c1081de0053b11f189695376c24dd689"
tags: []

---

# 📋 Endpoints Manquants Ajoutés - TaxiTrack Backend

**Date** : 8 février 2026  
**Projet** : TaxiTrack Backend API  
**Statut** : ✅ Phase 1 et Phase 2 complètes

---

## 📌 RÉSUMÉ DES AJOUTS

### ✅ Phase 1 : Endpoints REST API Manquants

1. **PATCH /api/auth/profile** - Mise à jour du profil utilisateur
2. **POST /api/client/rides/:id/cancel** - Annulation d'une course par le client

### ✅ Phase 2 : Socket.io Temps Réel

1. Infrastructure WebSocket complète
2. Authentification JWT pour Socket.io
3. Système de rooms automatiques
4. 5 événements temps réel implémentés
5. Intégration dans tous les contrôleurs
6. Page de test HTML interactive

---

## 🔧 PHASE 1 : ENDPOINTS REST API

### 1. PATCH /api/auth/profile

**Fichier** : `src/controllers/authController.js`  
**Route** : `src/routes/authRoutes.js`

#### Description
Permet à un utilisateur connecté (client ou chauffeur) de mettre à jour son profil.

#### Authentification
- ✅ Token JWT requis
- ✅ Middleware `authenticate`

#### Corps de la requête (tous optionnels)
```json
{
  "nom": "Nouveaunom",
  "prenom": "Nouveauprenom",
  "telephone": "+22670123456",
  "lieu_residence": "Ouaga 2000"
}
```

#### Validation
- `nom` : minimum 2 caractères (optionnel)
- `prenom` : minimum 2 caractères (optionnel)
- `telephone` : format valide (optionnel)
- `lieu_residence` : texte libre (optionnel)

#### Logique métier
1. Récupère `userId` et `role` depuis `req.user` (décodé du token)
2. Construit dynamiquement la requête SQL UPDATE
3. Met à jour `client_profiles` OU `driver_profiles` selon le rôle
4. Seuls les champs fournis sont mis à jour
5. Transaction avec `BEGIN/COMMIT/ROLLBACK`

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "profile": {
      "nom": "Nouveaunom",
      "prenom": "Nouveauprenom",
      "telephone": "+22670123456",
      "lieu_residence": "Ouaga 2000"
    }
  }
}
```

#### Test cURL
```bash
curl -X PATCH http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Doe",
    "prenom": "John",
    "telephone": "+22670123456",
    "lieu_residence": "Ouagadougou"
  }'
```

---

### 2. POST /api/client/rides/:id/cancel

**Fichier** : `src/controllers/clientController.js`  
**Route** : `src/routes/clientRoutes.js`

#### Description
Permet au client d'annuler une course qu'il a créée.

#### Authentification
- ✅ Token JWT requis
- ✅ Middleware `authenticate`
- ✅ Middleware `authorize('client')`

#### Paramètres
- `id` : ID de la course (integer, dans l'URL)

#### Validation
- L'ID doit être un entier valide
- La course doit appartenir au client connecté
- La course doit être dans un statut annulable

#### Statuts annulables
- ✅ `pending` : En attente de chauffeur
- ✅ `accepted` : Acceptée par un chauffeur (mais pas encore arrivé)

#### Statuts NON annulables
- ❌ `arrived` : Le chauffeur est arrivé
- ❌ `in_progress` : Le trajet a commencé
- ❌ `completed` : Le trajet est terminé
- ❌ `cancelled` : Déjà annulée

#### Logique métier
1. Vérifie que la course existe et appartient au client
2. Vérifie que le statut est `pending` ou `accepted`
3. UPDATE `rides` SET `status = 'cancelled'`
4. Si un chauffeur était assigné, lui envoie une notification Socket.io

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Course annulée avec succès"
}
```

#### Réponse erreur (400)
```json
{
  "success": false,
  "message": "Impossible d'annuler cette course. Statut actuel: in_progress"
}
```

#### Test cURL
```bash
curl -X POST http://localhost:5000/api/client/rides/5/cancel \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

---

## 🔌 PHASE 2 : SOCKET.IO TEMPS RÉEL

### Architecture Globale

**Fichiers créés/modifiés** :
- ✅ `src/config/socket.js` - Configuration Socket.io
- ✅ `src/server.js` - Intégration HTTP + WebSocket
- ✅ `src/controllers/clientController.js` - Notifications clients
- ✅ `src/controllers/driverController.js` - Notifications chauffeurs
- ✅ `test-socket.html` - Page de test interactive

---

### 1. Configuration Socket.io

**Fichier** : `src/config/socket.js`

#### Fonctions principales

##### `initializeSocket(httpServer)`
Initialise Socket.io avec :
- CORS configuré (`origin: '*'` pour dev, à restreindre en production)
- Transports : WebSocket + Polling
- Reconnexion automatique

##### `getIO()`
Retourne l'instance Socket.io globale pour l'utiliser dans les contrôleurs.

#### Middleware d'authentification
Chaque connexion Socket.io :
1. Récupère le token depuis `socket.handshake.auth.token`
2. Vérifie et décode le JWT avec `jwt.verify()`
3. Ajoute `socket.userId`, `socket.userEmail`, `socket.userRole`
4. Rejette la connexion si le token est invalide

#### Rooms automatiques
À la connexion, chaque utilisateur rejoint :
- `user_${userId}` : Room personnelle pour notifications ciblées
- `drivers` : Si rôle = driver
- `clients` : Si rôle = client

---

### 2. Événements Socket.io Implémentés

#### 📤 Événements ÉMIS par le serveur

##### 1️⃣ `new_ride_request`
**Destinataires** : Tous les chauffeurs (room `drivers`)  
**Déclenché par** : `POST /api/client/rides/request`  
**Données envoyées** :
```json
{
  "ride_id": 42,
  "client": {
    "name": "Amadou Traoré"
  },
  "pickup": {
    "address": "Place des Nations Unies",
    "lat": 12.3714,
    "long": -1.5197
  },
  "destination": {
    "address": "Aéroport de Ouagadougou",
    "lat": 12.3532,
    "long": -1.5124
  },
  "price": 3500.00,
  "created_at": "2026-02-08T14:30:00.000Z"
}
```

##### 2️⃣ `ride_accepted`
**Destinataire** : Le client concerné (room `user_${client_id}`)  
**Déclenché par** : `POST /api/driver/rides/:id/accept`  
**Données envoyées** :
```json
{
  "ride_id": 42,
  "driver": {
    "name": "Mamadou Ouedraogo",
    "phone": "+22670123456",
    "car": {
      "model": "Toyota Corolla",
      "plate": "BF-123-AB"
    }
  },
  "message": "Un chauffeur a accepté votre course !"
}
```

##### 3️⃣ `driver_position`
**Destinataire** : Le client de la course active (room `user_${client_id}`)  
**Déclenché par** : Événement `update_location` reçu du chauffeur  
**Données envoyées** :
```json
{
  "lat": 12.3714,
  "long": -1.5197,
  "timestamp": "2026-02-08T14:35:00.000Z"
}
```

##### 4️⃣ `status_changed`
**Destinataire** : Le client concerné (room `user_${client_id}`)  
**Déclenché par** : `PATCH /api/driver/rides/:id/status`  
**Données envoyées** :
```json
{
  "ride_id": 42,
  "status": "arrived",
  "message": "Votre chauffeur est arrivé au point de départ !",
  "updated_at": "2026-02-08T14:40:00.000Z"
}
```

Messages personnalisés par statut :
- `arrived` → "Votre chauffeur est arrivé au point de départ !"
- `in_progress` → "Votre trajet a commencé"
- `completed` → "Votre trajet est terminé. Merci d'avoir utilisé TaxiTrack !"

##### 5️⃣ `ride_cancelled`
**Destinataire** : Le chauffeur assigné (room `user_${driver_id}`)  
**Déclenché par** : `POST /api/client/rides/:id/cancel`  
**Données envoyées** :
```json
{
  "ride_id": 42,
  "message": "Le client a annulé la course"
}
```

---

#### 📥 Événements REÇUS par le serveur

##### `update_location`
**Émetteur** : Chauffeur  
**Données reçues** :
```json
{
  "lat": 12.3714,
  "long": -1.5197
}
```

**Logique** :
1. Vérifie que l'émetteur est un chauffeur (`socket.userRole === 'driver'`)
2. UPDATE `driver_profiles` SET `current_lat`, `current_long`, `last_location_update`
3. Récupère la course active du chauffeur
4. Si course active, émet `driver_position` au client concerné

---

### 3. Intégration dans les Contrôleurs

#### clientController.js

##### Fonction `requestRide`
**Ajout** :
```javascript
// Récupérer le profil client
const profileResult = await pool.query(
  'SELECT nom, prenom FROM client_profiles WHERE user_id = $1',
  [clientId]
);
const profile = profileResult.rows[0];

// Après création de la course
const ride = result.rows[0];

// Notification Socket.io
if (req.io) {
  req.io.to('drivers').emit('new_ride_request', {
    ride_id: ride.id,
    client: { name: `${profile?.prenom} ${profile?.nom}` },
    pickup: { ... },
    destination: { ... },
    price: parseFloat(ride.prix),
    created_at: ride.created_at
  });
  console.log(`📢 Notification envoyée aux chauffeurs pour la course ${ride.id}`);
}
```

##### Fonction `cancelRide`
**Ajout** :
```javascript
// Récupérer le driver_id avant annulation
const rideDetails = await pool.query(
  'SELECT driver_id FROM rides WHERE id = $1',
  [rideId]
);
const driverId = rideDetails.rows[0]?.driver_id;

// Après annulation
if (driverId && req.io) {
  req.io.to(`user_${driverId}`).emit('ride_cancelled', {
    ride_id: rideId,
    message: 'Le client a annulé la course'
  });
}
```

---

#### driverController.js

##### Fonction `acceptRide`
**Ajout** :
```javascript
// Récupérer infos chauffeur + voiture
const driverInfo = await pool.query(
  `SELECT dp.nom, dp.prenom, dp.telephone, 
          c.nom_modele, c.plaque_immatriculation
   FROM driver_profiles dp
   LEFT JOIN cars c ON dp.car_id = c.id
   WHERE dp.user_id = $1`,
  [driverId]
);

const driver = driverInfo.rows[0];

// Notification client
if (req.io) {
  req.io.to(`user_${ride.client_id}`).emit('ride_accepted', {
    ride_id: rideId,
    driver: {
      name: `${driver.prenom} ${driver.nom}`,
      phone: driver.telephone,
      car: {
        model: driver.nom_modele || 'Non renseigné',
        plate: driver.plaque_immatriculation || 'N/A'
      }
    },
    message: 'Un chauffeur a accepté votre course !'
  });
}
```

##### Fonction `updateRideStatus`
**Ajout** :
```javascript
const messages = {
  'arrived': 'Votre chauffeur est arrivé au point de départ !',
  'in_progress': 'Votre trajet a commencé',
  'completed': 'Votre trajet est terminé. Merci d\'avoir utilisé TaxiTrack !'
};

if (req.io && messages[status]) {
  req.io.to(`user_${ride.client_id}`).emit('status_changed', {
    ride_id: rideId,
    status,
    message: messages[status],
    updated_at: ride.updated_at
  });
}
```

---

### 4. Modification de server.js

**Changements majeurs** :

```javascript
const http = require('http');
const { initializeSocket } = require('./config/socket');

// Créer serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.io
const io = initializeSocket(server);

// Rendre io accessible dans toutes les routes
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Démarrer avec WebSocket
server.listen(PORT, () => {
  console.log('================================');
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('WebSocket: Actif');
  console.log('================================');
});
```

---

### 5. Page de Test test-socket.html

**Fonctionnalités** :
- ✅ Connexion avec token JWT
- ✅ Sélection rôle (client/driver)
- ✅ Envoi position GPS (chauffeurs uniquement)
- ✅ Journal temps réel avec couleurs
- ✅ Logs détaillés dans la console navigateur
- ✅ Affichage statut connexion
- ✅ Écoute tous les événements Socket.io

**Usage** :
1. Ouvrir `test-socket.html` dans 2 onglets
2. Onglet 1 : Connecter avec token CLIENT
3. Onglet 2 : Connecter avec token DRIVER
4. Créer une course via `POST /api/client/rides/request`
5. Observer les notifications en temps réel

---

## 🔒 CORRECTIF CORS Socket.io

**Problème rencontré** :  
Connexion Socket.io échouait avec la configuration initiale CORS restrictive.

**Solution appliquée** (`src/config/socket.js`) :
```javascript
io = new Server(httpServer, {
  cors: {
    origin: '*',  // Temporaire pour le debug
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['*']
  },
  // ...
});
```

**⚠️ IMPORTANT pour la production** :
Remplacer `origin: '*'` par les domaines autorisés :
```javascript
origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
```

---

## 📊 TESTS EFFECTUÉS

### ✅ Tests REST API
- PATCH /api/auth/profile → ✅ Profil mis à jour
- POST /api/client/rides/:id/cancel → ✅ Course annulée (statuts `pending`, `accepted`)
- POST /api/client/rides/:id/cancel → ✅ Rejet si statut non annulable

### ✅ Tests Socket.io
- Connexion client → ✅ Rejoint room `user_X` et `clients`
- Connexion chauffeur → ✅ Rejoint room `user_Y` et `drivers`
- Création course → ✅ Notification `new_ride_request` reçue par chauffeurs
- Acceptation course → ✅ Notification `ride_accepted` reçue par client
- Changement statut → ✅ Notification `status_changed` reçue par client
- Envoi position GPS → ✅ Notification `driver_position` reçue par client
- Annulation course → ✅ Notification `ride_cancelled` reçue par chauffeur

---

## 📁 FICHIERS MODIFIÉS/CRÉÉS

### Nouveaux fichiers
```
src/config/socket.js          ← Configuration Socket.io + authentification
test-socket.html              ← Page de test interactive
endpoints-manquants-ajoutes.md ← Ce fichier
```

### Fichiers modifiés
```
src/server.js                 ← Intégration HTTP + WebSocket
src/controllers/authController.js     ← Ajout updateProfile
src/controllers/clientController.js   ← Ajout cancelRide + notifications
src/controllers/driverController.js   ← Ajout notifications temps réel
src/routes/authRoutes.js      ← Route PATCH /profile
src/routes/clientRoutes.js    ← Route POST /rides/:id/cancel
```

---

## 🚀 PROCHAINES ÉTAPES

### ⏳ Phase 3 : Backend Admin (EN ATTENTE)

Selon le document **"Specifications Techniques Dashboard Admin.pdf"**, il reste à implémenter :

#### Endpoints à créer
1. **GET /api/admin/stats/drivers** - Statistiques chauffeurs
2. **GET /api/admin/stats/vehicles** - Statistiques véhicules
3. **GET /api/admin/stats/clients** - Statistiques clients
4. **GET /api/admin/stats/maintenance** - Stats maintenance
5. **GET /api/admin/stats/feedbacks** - Stats avis
6. **GET /api/admin/drivers** - Liste chauffeurs avec filtres
7. **GET /api/admin/drivers/:id** - Détails chauffeur
8. **POST /api/admin/drivers** - Créer chauffeur
9. **PATCH /api/admin/drivers/:id** - Modifier chauffeur
10. **DELETE /api/admin/drivers/:id** - Supprimer chauffeur
11. **GET /api/admin/cars** - Liste véhicules
12. **GET /api/admin/cars/:id** - Détails véhicule
13. **POST /api/admin/cars** - Ajouter véhicule
14. **PATCH /api/admin/cars/:id** - Modifier véhicule
15. **DELETE /api/admin/cars/:id** - Supprimer véhicule
16. **GET /api/admin/clients** - Liste clients
17. **DELETE /api/admin/clients/:id** - Supprimer client
18. **GET /api/admin/maintenance** - Historique maintenance
19. **POST /api/admin/maintenance** - Ajouter maintenance
20. **GET /api/admin/feedbacks** - Liste avis clients

**Note** : Cette phase sera développée EN DERNIER selon directive utilisateur.

---

## 📝 NOTES IMPORTANTES

### Sécurité
- ✅ Authentification JWT sur tous les endpoints
- ✅ Autorisation par rôle (`client`, `driver`, `admin`)
- ✅ Validation des données d'entrée
- ✅ Protection contre l'injection SQL (requêtes paramétrées)
- ⚠️ CORS `origin: '*'` à restreindre en production

### Base de données
- ✅ Transactions pour opérations critiques
- ✅ Gestion des erreurs PostgreSQL
- ✅ Indexes pour performances (sur `client_id`, `driver_id`, `status`)

### WebSocket
- ✅ Reconnexion automatique côté client
- ✅ Heartbeat pour détecter déconnexions
- ✅ Logs détaillés pour debug
- ✅ Gestion erreurs connexion

---

## 🎯 STATUT FINAL

| Phase | Statut | Progression |
|-------|--------|-------------|
| Phase 1 : Endpoints REST manquants | ✅ Complète | 100% |
| Phase 2 : Socket.io temps réel | ✅ Complète | 100% |
| Phase 3 : Backend Admin | ⏳ En attente | 0% |

**Backend Client + Driver + WebSocket** : ✅ **100% FONCTIONNEL**

---

**Auteur** : Documentation technique TaxiTrack  
**Dernière mise à jour** : 8 février 2026