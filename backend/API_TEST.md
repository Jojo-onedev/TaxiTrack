# Guide de Tests API - TaxiTrack Backend

Ce document contient tous les tests pour vérifier que l'API fonctionne correctement.

---

## 🛠️ Prérequis

1. Le serveur doit être démarré : `npm run dev`
2. La base de données doit contenir des données de test : `npm run db:seed`
3. Vous aurez besoin de **curl** (installé par défaut sur Linux/Mac) ou **Postman**

---

## 📋 Comptes de test disponibles

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@taxitrack.com | password123 | Admin |
| driver1@taxitrack.com | password123 | Chauffeur |
| driver2@taxitrack.com | password123 | Chauffeur |
| client1@test.com | password123 | Client |
| client2@test.com | password123 | Client |

---

## 🔄 Cycle de vie complet d'une course
```
Client demande course (pending)
    ↓
Driver accepte (accepted)
    ↓
Driver arrive au départ (arrived)
    ↓
Trajet commence (in_progress)
    ↓
Trajet terminé (completed)
    ↓
Client note le chauffeur (rated)
```

---

## 1️⃣ TESTS D'AUTHENTIFICATION

### ✅ Test 1.1 : Vérifier que le serveur fonctionne

**Commande :**
```bash
curl http://localhost:5000
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Bienvenue sur l'API TaxiTrack",
  "version": "1.0.0",
  "endpoints": {...}
}
```

---

### ✅ Test 1.2 : Connexion Client

**Commande :**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client1@test.com",
    "password": "password123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 4,
      "email": "client1@test.com",
      "role": "client",
      "nom": "Sawadogo",
      "prenom": "Ibrahim",
      "telephone": "+22670111222",
      "lieu_residence": "Ouagadougou, Secteur 12"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANT : Copiez le `TOKEN_CLIENT` retourné !**

---

### ✅ Test 1.3 : Connexion Chauffeur

**Commande :**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver1@taxitrack.com",
    "password": "password123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 2,
      "email": "driver1@taxitrack.com",
      "role": "driver",
      "nom": "Ouedraogo",
      "prenom": "Jean",
      "telephone": "+22670123456",
      "cnib": "B123456789",
      "nom_modele": "Toyota Corolla 2020",
      "plaque_immatriculation": "ABC-1234-BF"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANT : Copiez le `TOKEN_DRIVER` retourné !**

---

### ✅ Test 1.4 : Inscription nouveau client

**Commande :**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveauclient@test.com",
    "password": "password123",
    "nom": "Traoré",
    "prenom": "Aminata",
    "telephone": "+22670555666",
    "lieu_residence": "Ouagadougou, Secteur 25"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

---

### ✅ Test 1.5 : Récupérer son profil (route protégée)

**Commande :**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN_CLIENT"
```

**⚠️ Remplacez `TOKEN_CLIENT` par le token obtenu au Test 1.2**

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "email": "client1@test.com",
    "role": "client",
    "nom": "Sawadogo",
    "prenom": "Ibrahim",
    "telephone": "+22670111222",
    "lieu_residence": "Ouagadougou, Secteur 12"
  }
}
```

---

### ❌ Test 1.6 : Connexion avec mauvais mot de passe (doit échouer)

**Commande :**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client1@test.com",
    "password": "mauvais_mdp"
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

---

## 2️⃣ TESTS CLIENT - GESTION DES COURSES

**⚠️ Pour tous ces tests, utilisez le `TOKEN_CLIENT` obtenu au Test 1.2**

---

### ✅ Test 2.1 : Demander une course

**Commande :**
```bash
curl -X POST http://localhost:5000/api/client/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "pickup_address": "Avenue de l Independance, Ouagadougou",
    "pickup_lat": 12.3714,
    "pickup_long": -1.5197,
    "dest_address": "Aéroport de Ouagadougou",
    "dest_lat": 12.3532,
    "dest_long": -1.5124
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Demande de course créée avec succès",
  "data": {
    "ride": {
      "id": 1,
      "pickup": {
        "address": "Avenue de l Independance, Ouagadougou",
        "lat": 12.3714,
        "long": -1.5197
      },
      "destination": {
        "address": "Aéroport de Ouagadougou",
        "lat": 12.3532,
        "long": -1.5124
      },
      "status": "pending",
      "estimated_price": 934.71,
      "distance_km": "2.17",
      "created_at": "2026-02-05T23:19:05.964Z"
    }
  }
}
```

**📝 Note : Le prix est calculé automatiquement (500 FCFA base + 200 FCFA/km)**

**⚠️ IMPORTANT : Notez le `RIDE_ID` (ici 1) pour les tests suivants !**

---

### ✅ Test 2.2 : Récupérer la course active

**Commande :**
```bash
curl -X GET http://localhost:5000/api/client/rides/active \
  -H "Authorization: Bearer TOKEN_CLIENT"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": 1,
      "status": "pending",
      "pickup": {...},
      "destination": {...},
      "price": 934.71,
      "driver": null,
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

**📝 Note : `driver` est `null` car aucun chauffeur n'a encore accepté**

---

### ❌ Test 2.3 : Essayer de créer une 2ème course (doit échouer)

**Commande :**
```bash
curl -X POST http://localhost:5000/api/client/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "pickup_address": "Test",
    "pickup_lat": 12.3714,
    "pickup_long": -1.5197,
    "dest_address": "Test2",
    "dest_lat": 12.3532,
    "dest_long": -1.5124
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Vous avez déjà une course en cours"
}
```

---

### ✅ Test 2.4 : Récupérer l'historique des courses

**Commande :**
```bash
curl -X GET http://localhost:5000/api/client/rides/history \
  -H "Authorization: Bearer TOKEN_CLIENT"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "rides": [],
    "pagination": {
      "current_page": 1,
      "total_pages": 0,
      "total_rides": 0,
      "per_page": 20
    }
  }
}
```

**📝 Note : Vide car aucune course n'est encore terminée**

---

### ✅ Test 2.5 : Récupérer l'historique avec pagination

**Commande :**
```bash
curl -X GET "http://localhost:5000/api/client/rides/history?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN_CLIENT"
```

---

### ✅ Test 2.6 : Noter une course (après qu'elle soit terminée)

**⚠️ Ce test ne fonctionnera qu'après avoir terminé le cycle complet (voir section 4)**

**Commande :**
```bash
curl -X POST http://localhost:5000/api/client/rides/RIDE_ID/rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "rating": 5,
    "comment": "Excellent chauffeur, très ponctuel !"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Merci pour votre avis !",
  "data": {
    "ride_id": 1,
    "rating": 5,
    "comment": "Excellent chauffeur, très ponctuel !"
  }
}
```

---

### ❌ Test 2.7 : Validation des coordonnées GPS (doit échouer)

**Commande :**
```bash
curl -X POST http://localhost:5000/api/client/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "pickup_address": "Test",
    "pickup_lat": 999,
    "pickup_long": -1.5197,
    "dest_address": "Test2",
    "dest_lat": 12.3532,
    "dest_long": -1.5124
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "msg": "Latitude de départ invalide",
      "param": "pickup_lat",
      ...
    }
  ]
}
```

---

### ❌ Test 2.8 : Accès refusé sans token

**Commande :**
```bash
curl -X GET http://localhost:5000/api/client/rides/active
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Token manquant ou format invalide"
}
```

---

### ❌ Test 2.9 : Accès refusé avec mauvais rôle

**Commande :**
```bash
curl -X GET http://localhost:5000/api/client/rides/active \
  -H "Authorization: Bearer TOKEN_DRIVER"
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Accès refusé : permissions insuffisantes"
}
```

---

## 3️⃣ TESTS DRIVER - GESTION DES COURSES

**⚠️ Pour tous ces tests, utilisez le `TOKEN_DRIVER` obtenu au Test 1.3**

---

### ✅ Test 3.1 : Passer en ligne (disponible)

**Commande :**
```bash
curl -X PATCH http://localhost:5000/api/driver/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{
    "is_online": true
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Vous êtes maintenant en ligne",
  "data": {
    "is_online": true
  }
}
```

---

### ✅ Test 3.2 : Voir les courses disponibles

**Commande :**
```bash
curl -X GET http://localhost:5000/api/driver/rides/available \
  -H "Authorization: Bearer TOKEN_DRIVER"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": 1,
        "client": {
          "name": "Ibrahim Sawadogo",
          "phone": "+22670111222"
        },
        "pickup": {
          "address": "Avenue de l Independance, Ouagadougou",
          "lat": 12.3714,
          "long": -1.5197
        },
        "destination": {
          "address": "Aéroport de Ouagadougou",
          "lat": 12.3532,
          "long": -1.5124
        },
        "price": 934.71,
        "distance_from_driver": "N/A",
        "created_at": "2026-02-05T23:19:05.964Z"
      }
    ],
    "total": 1
  }
}
```

**📝 Note : Vous voyez la course créée par le client au Test 2.1**

---

### ✅ Test 3.3 : Accepter une course

**Commande :**
```bash
curl -X POST http://localhost:5000/api/driver/rides/RIDE_ID/accept \
  -H "Authorization: Bearer TOKEN_DRIVER"
```

**⚠️ Remplacez `RIDE_ID` par l'ID de la course (ex: 1)**

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Course acceptée avec succès",
  "data": {
    "ride": {
      "id": 1,
      "status": "accepted",
      "pickup": {...},
      "destination": {...},
      "price": 934.71
    }
  }
}
```

**📝 Note : Le statut passe de `pending` à `accepted`**

---

### ✅ Test 3.4 : Vérifier que le client voit maintenant le chauffeur

**Commande (avec TOKEN_CLIENT) :**
```bash
curl -X GET http://localhost:5000/api/client/rides/active \
  -H "Authorization: Bearer TOKEN_CLIENT"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": 1,
      "status": "accepted",
      ...
      "driver": {
        "name": "Jean Ouedraogo",
        "phone": "+22670123456",
        "car": {
          "model": "Toyota Corolla 2020",
          "plate": "ABC-1234-BF"
        }
      }
    }
  }
}
```

**📝 Note : `driver` n'est plus `null` !**

---

### ✅ Test 3.5 : Chauffeur arrive au point de départ

**Commande :**
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{
    "status": "arrived"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Statut mis à jour: arrived",
  "data": {
    "ride": {
      "id": 1,
      "status": "arrived",
      "updated_at": "2026-02-05T23:42:33.169Z",
      "completed_at": null
    }
  }
}
```

---

### ✅ Test 3.6 : Trajet commence (client à bord)

**Commande :**
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{
    "status": "in_progress"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Statut mis à jour: in_progress",
  "data": {
    "ride": {
      "id": 1,
      "status": "in_progress",
      "updated_at": "2026-02-05T23:43:05.589Z",
      "completed_at": null
    }
  }
}
```

---

### ✅ Test 3.7 : Trajet terminé

**Commande :**
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{
    "status": "completed"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Statut mis à jour: completed",
  "data": {
    "ride": {
      "id": 1,
      "status": "completed",
      "updated_at": "2026-02-05T23:43:15.967Z",
      "completed_at": "2026-02-05T23:43:15.967Z"
    }
  }
}
```

**📝 Note : `completed_at` est maintenant enregistré !**

---

### ✅ Test 3.8 : Voir les statistiques du chauffeur

**Commande :**
```bash
curl -X GET http://localhost:5000/api/driver/stats/summary \
  -H "Authorization: Bearer TOKEN_DRIVER"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "earned_today": 934.71,
    "rating": "0.0",
    "total_rides": 1
  }
}
```

**📝 Note : `rating` sera mis à jour après que le client note la course**

---

### ✅ Test 3.9 : Voir les infos du véhicule

**Commande :**
```bash
curl -X GET http://localhost:5000/api/driver/car \
  -H "Authorization: Bearer TOKEN_DRIVER"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "car": {
      "id": 1,
      "model": "Toyota Corolla 2020",
      "plate": "ABC-1234-BF",
      "status": "available"
    }
  }
}
```

---

### ✅ Test 3.10 : Passer hors ligne (indisponible)

**Commande :**
```bash
curl -X PATCH http://localhost:5000/api/driver/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{
    "is_online": false
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Vous êtes maintenant hors ligne",
  "data": {
    "is_online": false
  }
}
```

---

### ❌ Test 3.11 : Essayer d'accepter une course déjà prise (doit échouer)

**Commande (avec un 2ème chauffeur) :**
```bash
curl -X POST http://localhost:5000/api/driver/rides/RIDE_ID/accept \
  -H "Authorization: Bearer TOKEN_DRIVER2"
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Cette course n'est plus disponible"
}
```

---

### ❌ Test 3.12 : Essayer de mettre à jour une course qui ne vous appartient pas

**Commande (avec un 2ème chauffeur) :**
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER2" \
  -d '{
    "status": "completed"
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Course non trouvée ou vous n'êtes pas assigné à cette course"
}
```

---

## 4️⃣ CYCLE COMPLET - SCÉNARIO FIN À FIN

Voici un scénario complet qui teste tout le flux :

### Étape 1 : Client demande une course
```bash
curl -X POST http://localhost:5000/api/client/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "pickup_address": "Place des Nations Unies",
    "pickup_lat": 12.3700,
    "pickup_long": -1.5300,
    "dest_address": "Université de Ouagadougou",
    "dest_lat": 12.3600,
    "dest_long": -1.5250
  }'
```
✅ Statut : `pending`

---

### Étape 2 : Chauffeur passe en ligne
```bash
curl -X PATCH http://localhost:5000/api/driver/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{"is_online": true}'
```
✅ Chauffeur disponible

---

### Étape 3 : Chauffeur voit la course
```bash
curl -X GET http://localhost:5000/api/driver/rides/available \
  -H "Authorization: Bearer TOKEN_DRIVER"
```
✅ Course visible

---

### Étape 4 : Chauffeur accepte
```bash
curl -X POST http://localhost:5000/api/driver/rides/RIDE_ID/accept \
  -H "Authorization: Bearer TOKEN_DRIVER"
```
✅ Statut : `accepted`

---

### Étape 5 : Client voit le chauffeur
```bash
curl -X GET http://localhost:5000/api/client/rides/active \
  -H "Authorization: Bearer TOKEN_CLIENT"
```
✅ Infos chauffeur visibles

---

### Étape 6 : Chauffeur arrive
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{"status": "arrived"}'
```
✅ Statut : `arrived`

---

### Étape 7 : Trajet commence
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{"status": "in_progress"}'
```
✅ Statut : `in_progress`

---

### Étape 8 : Trajet terminé
```bash
curl -X PATCH http://localhost:5000/api/driver/rides/RIDE_ID/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DRIVER" \
  -d '{"status": "completed"}'
```
✅ Statut : `completed`

---

### Étape 9 : Client note le chauffeur
```bash
curl -X POST http://localhost:5000/api/client/rides/RIDE_ID/rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -d '{
    "rating": 5,
    "comment": "Parfait !"
  }'
```
✅ Note enregistrée

---

### Étape 10 : Vérifier les stats du chauffeur
```bash
curl -X GET http://localhost:5000/api/driver/stats/summary \
  -H "Authorization: Bearer TOKEN_DRIVER"
```
✅ Revenus et note mis à jour

---

### Étape 11 : Vérifier l'historique du client
```bash
curl -X GET http://localhost:5000/api/client/rides/history \
  -H "Authorization: Bearer TOKEN_CLIENT"
```
✅ Course dans l'historique

---

## 📊 Checklist de validation complète

### Authentification
- [ ] Serveur démarre correctement
- [ ] Login Client fonctionne
- [ ] Login Driver fonctionne
- [ ] Inscription Client fonctionne
- [ ] Route protégée /me fonctionne
- [ ] Mauvais mot de passe rejeté

### Client - Courses
- [ ] Demande de course fonctionne
- [ ] Prix calculé automatiquement
- [ ] Course active retournée
- [ ] Impossible de créer 2 courses
- [ ] Historique fonctionne
- [ ] Notation fonctionne
- [ ] Validation GPS fonctionne
- [ ] Accès refusé sans token
- [ ] Accès refusé avec mauvais rôle

### Driver - Courses
- [ ] Passer en ligne/hors ligne
- [ ] Voir courses disponibles
- [ ] Accepter une course
- [ ] Mettre à jour statut (arrived)
- [ ] Mettre à jour statut (in_progress)
- [ ] Mettre à jour statut (completed)
- [ ] Statistiques affichées
- [ ] Infos véhicule retournées
- [ ] Course déjà prise refusée
- [ ] Modification course d'autrui refusée

### Cycle complet
- [ ] pending → accepted → arrived → in_progress → completed
- [ ] Client voit le chauffeur après acceptation
- [ ] Notation après completion
- [ ] Stats mises à jour
- [ ] Historique mis à jour

---

## 🔧 Dépannage

### Problème : "Token invalide"
**Solution :** Reconnectez-vous pour obtenir un nouveau token (expiration après 7 jours)

### Problème : "Course non trouvée"
**Solution :** Vérifiez l'ID de la course, utilisez l'ID retourné lors de la création

### Problème : "Vous avez déjà une course en cours"
**Solution :** Terminez ou annulez la course actuelle d'abord

### Problème : "Cette course n'est plus disponible"
**Solution :** Un autre chauffeur a déjà accepté cette course

### Problème : "new row violates check constraint"
**Solution :** Exécutez `node database/update_ride_statuses.js`

### Problème : "Connexion à PostgreSQL échouée"
**Solution :** `sudo systemctl start postgresql`

---

## 📝 Notes importantes

- **Tokens JWT** : Expirent après 7 jours (configurable dans `.env`)
- **Prix** : Formule = 500 FCFA base + 200 FCFA/km
- **Statuts** : Ordre obligatoire → pending → accepted → arrived → in_progress → completed
- **Pagination** : Défaut 20 résultats/page, max 100
- **Note** : Entre 1 et 5 étoiles
- **Rôles** : client, driver, admin (authorization stricte)

---

## 🚀 Endpoints disponibles - Résumé

### Authentication (`/api/auth`)
- POST `/login` - Connexion
- POST `/register` - Inscription client
- GET `/me` - Profil utilisateur

### Client (`/api/client`)
- POST `/rides/request` - Demander course
- GET `/rides/active` - Course active
- GET `/rides/history` - Historique
- POST `/rides/:id/rating` - Noter course

### Driver (`/api/driver`)
- PATCH `/status` - En ligne/hors ligne
- GET `/rides/available` - Courses disponibles
- POST `/rides/:id/accept` - Accepter course
- PATCH `/rides/:id/update-status` - MAJ statut
- GET `/stats/summary` - Statistiques
- GET `/car` - Info véhicule

---

## 🎯 Prochaines étapes

Une fois ces tests validés :
1. ✅ Backend Client et Driver complets
2. ⏳ Implémenter Socket.io (temps réel)
3. ⏳ Backend Admin (CRUD)
4. ⏳ Tests de charge

---

**Dernière mise à jour** : Février 2026  
**Version API** : 1.0.0  
**Status** : ✅ Client & Driver 100% fonctionnels