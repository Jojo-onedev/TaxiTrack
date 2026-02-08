# 📖 TaxiTrack API - Documentation Complète

**Version** : 1.0.0  
**Date** : Février 2026  
**Base URL** : `http://localhost:5000/api`

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Endpoints Publics](#endpoints-publics)
4. [Endpoints Client](#endpoints-client)
5. [Endpoints Chauffeur](#endpoints-chauffeur)
6. [Endpoints Admin](#endpoints-admin)
7. [WebSocket (Socket.io)](#websocket-socketio)
8. [Codes d'erreur](#codes-derreur)
9. [Exemples d'utilisation](#exemples-dutilisation)

---

## 🎯 Introduction

TaxiTrack est une API REST complète pour gérer un système de taxi avec :
- ✅ Authentification JWT
- ✅ Gestion des utilisateurs (Clients, Chauffeurs, Admins)
- ✅ Système de réservation de courses
- ✅ Suivi GPS en temps réel via WebSocket
- ✅ Dashboard administrateur
- ✅ Gestion de maintenance des véhicules

### Technologies
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL
- **Authentification** : JWT (JSON Web Tokens)
- **Temps réel** : Socket.io
- **Validation** : express-validator

---

## 🔐 Authentification

### Format du token
Tous les endpoints protégés nécessitent un token JWT dans le header :

```http
Authorization: Bearer <votre_token_jwt>
```

### Rôles disponibles
- `client` : Utilisateur qui demande des courses
- `driver` : Chauffeur qui accepte et effectue les courses
- `admin` : Administrateur du système

---

## 📍 Endpoints Publics

### 1. Inscription

**POST** `/api/auth/register`

Créer un nouveau compte utilisateur.

**Body** :
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "client",
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+22670123456",
  "lieu_residence": "Ouagadougou"
}
```

**Validation** :
- `email` : Format email valide (requis)
- `password` : Minimum 6 caractères (requis)
- `role` : 'client' ou 'driver' (requis)
- `nom` : Minimum 2 caractères (requis)
- `prenom` : Minimum 2 caractères (requis)
- `telephone` : Non vide (requis)
- `lieu_residence` : Optionnel

**Réponse 201** :
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 15,
      "email": "john.doe@example.com",
      "role": "client"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs** :
- `400` : Email déjà utilisé
- `400` : Validation échouée

---

### 2. Connexion

**POST** `/api/auth/login`

Se connecter avec email et mot de passe.

**Body** :
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 15,
      "email": "john.doe@example.com",
      "role": "client"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs** :
- `401` : Email ou mot de passe incorrect

---

### 3. Informations du serveur

**GET** `/api/`

Vérifier que l'API fonctionne.

**Réponse 200** :
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

## 👤 Endpoints Client

**Authentification requise** : Oui  
**Rôle requis** : `client`

### 1. Mettre à jour son profil

**PATCH** `/api/auth/profile`

Modifier les informations de son profil.

**Headers** :
```http
Authorization: Bearer <token_client>
```

**Body** (tous les champs sont optionnels) :
```json
{
  "nom": "Nouveau nom",
  "prenom": "Nouveau prénom",
  "telephone": "+22670999888",
  "lieu_residence": "Ouaga 2000"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "profile": {
      "nom": "Nouveau nom",
      "prenom": "Nouveau prénom",
      "telephone": "+22670999888",
      "lieu_residence": "Ouaga 2000"
    }
  }
}
```

---

### 2. Demander une course

**POST** `/api/client/rides/request`

Créer une nouvelle demande de course.

**Headers** :
```http
Authorization: Bearer <token_client>
Content-Type: application/json
```

**Body** :
```json
{
  "pickup_address": "Place des Nations Unies, Ouagadougou",
  "pickup_lat": 12.3714,
  "pickup_long": -1.5197,
  "dest_address": "Aéroport de Ouagadougou",
  "dest_lat": 12.3532,
  "dest_long": -1.5124
}
```

**Validation** :
- Toutes les coordonnées doivent être des nombres valides
- Les adresses ne doivent pas être vides

**Réponse 201** :
```json
{
  "success": true,
  "message": "Demande de course créée avec succès",
  "data": {
    "ride": {
      "id": 42,
      "pickup": {
        "address": "Place des Nations Unies, Ouagadougou",
        "lat": 12.3714,
        "long": -1.5197
      },
      "destination": {
        "address": "Aéroport de Ouagadougou",
        "lat": 12.3532,
        "long": -1.5124
      },
      "status": "pending",
      "estimated_price": 3500.00,
      "distance_km": "15.23",
      "created_at": "2026-02-08T14:30:00.000Z"
    }
  }
}
```

**Notification WebSocket** : Tous les chauffeurs connectés reçoivent l'événement `new_ride_request`

**Erreurs** :
- `400` : Vous avez déjà une course en cours

---

### 3. Obtenir la course active

**GET** `/api/client/rides/active`

Récupérer la course en cours (si elle existe).

**Headers** :
```http
Authorization: Bearer <token_client>
```

**Réponse 200** (course active) :
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": 42,
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
      "status": "accepted",
      "price": 3500.00,
      "driver": {
        "id": 8,
        "name": "Mamadou Ouedraogo",
        "phone": "+22670123456",
        "current_position": {
          "lat": 12.3680,
          "long": -1.5210
        }
      },
      "car": {
        "model": "Toyota Corolla",
        "plate": "BF-123-AB",
        "color": "Blanche"
      },
      "created_at": "2026-02-08T14:30:00.000Z",
      "updated_at": "2026-02-08T14:35:00.000Z"
    }
  }
}
```

**Réponse 200** (aucune course active) :
```json
{
  "success": true,
  "data": {
    "ride": null
  }
}
```

---

### 4. Historique des courses

**GET** `/api/client/rides/history`

Récupérer l'historique de toutes les courses.

**Headers** :
```http
Authorization: Bearer <token_client>
```

**Query Parameters** (optionnels) :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 50)

**Exemple** : `/api/client/rides/history?page=2&limit=20`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": 41,
        "pickup_address": "Gare routière",
        "dest_address": "Université de Ouagadougou",
        "price": 2500.00,
        "status": "completed",
        "driver_name": "Ibrahim Sawadogo",
        "car_model": "Peugeot 508",
        "created_at": "2026-02-07T10:15:00.000Z"
      },
      {
        "id": 38,
        "pickup_address": "Marché central",
        "dest_address": "Hôpital Yalgado",
        "price": 1800.00,
        "status": "cancelled",
        "created_at": "2026-02-05T16:20:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 12,
      "total_pages": 2
    }
  }
}
```

---

### 5. Annuler une course

**POST** `/api/client/rides/:id/cancel`

Annuler une course en attente ou acceptée.

**Headers** :
```http
Authorization: Bearer <token_client>
```

**URL** : `/api/client/rides/42/cancel`

**Conditions** :
- La course doit appartenir au client
- Le statut doit être `pending` ou `accepted`
- Impossible d'annuler si statut : `arrived`, `in_progress`, `completed`, `cancelled`

**Réponse 200** :
```json
{
  "success": true,
  "message": "Course annulée avec succès"
}
```

**Notification WebSocket** : Le chauffeur assigné (si présent) reçoit l'événement `ride_cancelled`

**Erreurs** :
- `404` : Course non trouvée
- `403` : Cette course ne vous appartient pas
- `400` : Impossible d'annuler cette course. Statut actuel: in_progress

---

## 🚗 Endpoints Chauffeur

**Authentification requise** : Oui  
**Rôle requis** : `driver`

### 1. Mettre à jour son profil

**PATCH** `/api/auth/profile`

Même endpoint que pour les clients (voir section Client).

---

### 2. Courses disponibles

**GET** `/api/driver/rides/available`

Obtenir la liste des courses en attente de chauffeur.

**Headers** :
```http
Authorization: Bearer <token_driver>
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": 43,
        "client": {
          "name": "Amadou Traoré"
        },
        "pickup": {
          "address": "Stade du 4 Août",
          "lat": 12.3650,
          "long": -1.5220
        },
        "destination": {
          "address": "Zone industrielle",
          "lat": 12.3420,
          "long": -1.5080
        },
        "estimated_price": 2800.00,
        "distance_km": 11.5,
        "created_at": "2026-02-08T15:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Accepter une course

**POST** `/api/driver/rides/:id/accept`

Accepter une course disponible.

**Headers** :
```http
Authorization: Bearer <token_driver>
```

**URL** : `/api/driver/rides/43/accept`

**Conditions** :
- Le chauffeur doit être disponible (aucune course en cours)
- La course doit être au statut `pending`

**Réponse 200** :
```json
{
  "success": true,
  "message": "Course acceptée avec succès",
  "data": {
    "ride": {
      "id": 43,
      "status": "accepted",
      "client": {
        "name": "Amadou Traoré",
        "phone": "+22670888777"
      },
      "pickup": {
        "address": "Stade du 4 Août",
        "lat": 12.3650,
        "long": -1.5220
      },
      "destination": {
        "address": "Zone industrielle",
        "lat": 12.3420,
        "long": -1.5080
      },
      "price": 2800.00
    }
  }
}
```

**Notification WebSocket** : Le client reçoit l'événement `ride_accepted` avec les infos du chauffeur et du véhicule

**Erreurs** :
- `400` : Vous avez déjà une course en cours
- `404` : Course non trouvée
- `400` : Cette course n'est plus disponible

---

### 4. Course active

**GET** `/api/driver/rides/active`

Récupérer la course en cours du chauffeur.

**Headers** :
```http
Authorization: Bearer <token_driver>
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": 43,
      "client": {
        "name": "Amadou Traoré",
        "phone": "+22670888777"
      },
      "pickup": {
        "address": "Stade du 4 Août",
        "lat": 12.3650,
        "long": -1.5220
      },
      "destination": {
        "address": "Zone industrielle",
        "lat": 12.3420,
        "long": -1.5080
      },
      "status": "accepted",
      "price": 2800.00,
      "created_at": "2026-02-08T15:00:00.000Z"
    }
  }
}
```

---

### 5. Mettre à jour le statut d'une course

**PATCH** `/api/driver/rides/:id/status`

Changer le statut de la course (arrivé, en cours, terminée).

**Headers** :
```http
Authorization: Bearer <token_driver>
Content-Type: application/json
```

**URL** : `/api/driver/rides/43/status`

**Body** :
```json
{
  "status": "arrived"
}
```

**Statuts autorisés** :
- `arrived` : Chauffeur arrivé au point de départ
- `in_progress` : Trajet commencé
- `completed` : Trajet terminé

**Réponse 200** :
```json
{
  "success": true,
  "message": "Statut de la course mis à jour",
  "data": {
    "ride": {
      "id": 43,
      "status": "arrived",
      "updated_at": "2026-02-08T15:10:00.000Z"
    }
  }
}
```

**Notification WebSocket** : Le client reçoit l'événement `status_changed` avec un message personnalisé :
- `arrived` → "Votre chauffeur est arrivé au point de départ !"
- `in_progress` → "Votre trajet a commencé"
- `completed` → "Votre trajet est terminé. Merci d'avoir utilisé TaxiTrack !"

**Erreurs** :
- `400` : Statut invalide
- `403` : Cette course ne vous est pas assignée
- `404` : Course non trouvée

---

### 6. Historique des courses

**GET** `/api/driver/rides/history`

Récupérer l'historique de toutes les courses effectuées.

**Headers** :
```http
Authorization: Bearer <token_driver>
```

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 50)

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": 43,
        "client_name": "Amadou Traoré",
        "pickup_address": "Stade du 4 Août",
        "dest_address": "Zone industrielle",
        "price": 2800.00,
        "status": "completed",
        "created_at": "2026-02-08T15:00:00.000Z"
      }
    ],
    "statistics": {
      "total_rides": 87,
      "total_earnings": 245600.00,
      "completed_rides": 82,
      "cancelled_rides": 5
    },
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 87,
      "total_pages": 9
    }
  }
}
```

---

### 7. Mettre à jour la disponibilité

**PATCH** `/api/driver/availability`

Changer son statut de disponibilité.

**Headers** :
```http
Authorization: Bearer <token_driver>
Content-Type: application/json
```

**Body** :
```json
{
  "availability": true
}
```

**Réponse 200** :
```json
{
  "success": true,
  "message": "Disponibilité mise à jour",
  "data": {
    "availability": true
  }
}
```

---

## 👨‍💼 Endpoints Admin

**Authentification requise** : Oui  
**Rôle requis** : `admin`

### Statistiques

#### 1. Stats Chauffeurs

**GET** `/api/admin/stats/drivers`

**Headers** :
```http
Authorization: Bearer <token_admin>
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_drivers": 45,
      "available_drivers": 23,
      "busy_drivers": 22,
      "drivers_with_car": 42
    },
    "top_drivers": [
      {
        "user_id": 8,
        "nom": "Ouedraogo",
        "prenom": "Mamadou",
        "telephone": "+22670123456",
        "total_rides": 152,
        "total_earnings": 456000.00
      }
    ]
  }
}
```

---

#### 2. Stats Véhicules

**GET** `/api/admin/stats/vehicles`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_vehicles": 38,
      "active_vehicles": 32,
      "in_maintenance": 4,
      "inactive_vehicles": 2
    },
    "by_type": [
      {
        "type_vehicule": "berline",
        "count": 20
      },
      {
        "type_vehicule": "suv",
        "count": 12
      }
    ],
    "maintenance_needed": [
      {
        "id": 5,
        "nom_modele": "Toyota Corolla",
        "plaque_immatriculation": "BF-123-AB",
        "kilometrage": 95000,
        "last_maintenance": "2025-11-10"
      }
    ]
  }
}
```

---

#### 3. Stats Clients

**GET** `/api/admin/stats/clients`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_clients": 234,
      "active_last_30_days": 156
    },
    "top_clients": [
      {
        "user_id": 15,
        "nom": "Traoré",
        "prenom": "Amadou",
        "telephone": "+22670888777",
        "total_rides": 47,
        "total_spent": 132500.00
      }
    ],
    "new_clients_trend": [
      {
        "month": "2026-02",
        "new_clients": 12
      },
      {
        "month": "2026-01",
        "new_clients": 18
      }
    ]
  }
}
```

---

#### 4. Stats Maintenance

**GET** `/api/admin/stats/maintenance`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_maintenances": 127,
      "last_30_days": 15,
      "total_cost": 3450000.00,
      "average_cost": 27165.35
    },
    "by_type": [
      {
        "type_maintenance": "vidange",
        "count": 45,
        "total_cost": 675000.00
      },
      {
        "type_maintenance": "revision",
        "count": 38,
        "total_cost": 1520000.00
      }
    ],
    "recent_maintenances": [
      {
        "id": 89,
        "type_maintenance": "vidange",
        "description": "Vidange moteur + filtre",
        "cout": 45000.00,
        "date_maintenance": "2026-02-07",
        "nom_modele": "Toyota Camry",
        "plaque_immatriculation": "BF-456-CD"
      }
    ]
  }
}
```

---

#### 5. Stats Feedbacks

**GET** `/api/admin/stats/feedbacks`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_feedbacks": 0,
      "average_rating": 0,
      "five_stars": 0,
      "four_stars": 0,
      "three_stars": 0,
      "two_stars": 0,
      "one_star": 0
    },
    "recent_feedbacks": []
  }
}
```

*Note : Table feedbacks non implémentée dans le schéma actuel*

---

### Gestion Chauffeurs

#### 6. Liste des chauffeurs

**GET** `/api/admin/drivers`

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 100)
- `search` : Rechercher par nom, prénom ou téléphone
- `availability` : Filtrer par disponibilité (true/false)
- `has_car` : Filtrer si a un véhicule (true/false)

**Exemple** : `/api/admin/drivers?page=1&limit=10&search=ouedra&availability=true`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "drivers": [
      {
        "user_id": 8,
        "nom": "Ouedraogo",
        "prenom": "Mamadou",
        "telephone": "+22670123456",
        "lieu_residence": "Ouagadougou",
        "availability": true,
        "current_lat": "12.3714",
        "current_long": "-1.5197",
        "last_location_update": "2026-02-08T15:25:00.000Z",
        "car_id": 3,
        "email": "mamadou@example.com",
        "created_at": "2025-12-15T10:00:00.000Z",
        "car_model": "Toyota Corolla",
        "car_plate": "BF-123-AB",
        "car_type": "berline",
        "total_rides": 152,
        "total_earnings": 456000.00
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 45,
      "total_pages": 5
    }
  }
}
```

---

#### 7. Détails d'un chauffeur

**GET** `/api/admin/drivers/:id`

**URL** : `/api/admin/drivers/8`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "driver": {
      "user_id": 8,
      "nom": "Ouedraogo",
      "prenom": "Mamadou",
      "telephone": "+22670123456",
      "lieu_residence": "Ouagadougou",
      "availability": true,
      "current_lat": "12.3714",
      "current_long": "-1.5197",
      "car_id": 3,
      "email": "mamadou@example.com",
      "created_at": "2025-12-15T10:00:00.000Z",
      "nom_modele": "Toyota Corolla",
      "plaque_immatriculation": "BF-123-AB",
      "type_vehicule": "berline",
      "couleur": "Blanche",
      "annee_fabrication": 2020,
      "kilometrage": 75000,
      "car_status": "active"
    },
    "statistics": {
      "total_rides": 152,
      "completed_rides": 148,
      "cancelled_rides": 4,
      "total_earnings": 456000.00,
      "average_ride_price": 3081.08
    },
    "recent_rides": [
      {
        "id": 43,
        "depart_address": "Stade du 4 Août",
        "dest_address": "Zone industrielle",
        "prix": 2800.00,
        "status": "completed",
        "created_at": "2026-02-08T15:00:00.000Z",
        "client_nom": "Traoré",
        "client_prenom": "Amadou"
      }
    ]
  }
}
```

---

#### 8. Créer un chauffeur

**POST** `/api/admin/drivers`

**Body** :
```json
{
  "email": "nouveau.driver@example.com",
  "password": "Password123!",
  "nom": "Sawadogo",
  "prenom": "Ibrahim",
  "telephone": "+22670555444",
  "lieu_residence": "Bobo-Dioulasso",
  "car_id": 5
}
```

**Validation** :
- `email` : Format email valide (requis)
- `password` : Minimum 6 caractères (requis)
- `nom` : Minimum 2 caractères (requis)
- `prenom` : Minimum 2 caractères (requis)
- `telephone` : Non vide (requis)
- `lieu_residence` : Optionnel
- `car_id` : ID d'un véhicule non assigné (optionnel)

**Réponse 201** :
```json
{
  "success": true,
  "message": "Chauffeur créé avec succès",
  "data": {
    "user": {
      "id": 52,
      "email": "nouveau.driver@example.com",
      "role": "driver",
      "created_at": "2026-02-08T16:00:00.000Z"
    },
    "profile": {
      "user_id": 52,
      "nom": "Sawadogo",
      "prenom": "Ibrahim",
      "telephone": "+22670555444",
      "lieu_residence": "Bobo-Dioulasso",
      "car_id": 5,
      "availability": true
    }
  }
}
```

**Erreurs** :
- `400` : Cet email est déjà utilisé
- `400` : Ce véhicule est déjà assigné à un autre chauffeur

---

#### 9. Modifier un chauffeur

**PATCH** `/api/admin/drivers/:id`

**URL** : `/api/admin/drivers/8`

**Body** (tous les champs sont optionnels) :
```json
{
  "nom": "Ouedraogo",
  "prenom": "Mamadou",
  "telephone": "+22670999888",
  "lieu_residence": "Ouagadougou",
  "car_id": 10,
  "availability": false
}
```

**Réponse 200** :
```json
{
  "success": true,
  "message": "Chauffeur mis à jour avec succès",
  "data": {
    "profile": {
      "user_id": 8,
      "nom": "Ouedraogo",
      "prenom": "Mamadou",
      "telephone": "+22670999888",
      "lieu_residence": "Ouagadougou",
      "car_id": 10,
      "availability": false
    }
  }
}
```

**Erreurs** :
- `404` : Chauffeur non trouvé
- `400` : Ce véhicule est déjà assigné à un autre chauffeur
- `400` : Aucune donnée à mettre à jour

---

#### 10. Supprimer un chauffeur

**DELETE** `/api/admin/drivers/:id`

**URL** : `/api/admin/drivers/8`

**Conditions** :
- Le chauffeur ne doit pas avoir de courses actives

**Réponse 200** :
```json
{
  "success": true,
  "message": "Chauffeur supprimé avec succès"
}
```

**Erreurs** :
- `404` : Chauffeur non trouvé
- `400` : Impossible de supprimer ce chauffeur car il a des courses en cours

---

### Gestion Véhicules

#### 11. Liste des véhicules

**GET** `/api/admin/cars`

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 100)
- `search` : Rechercher par modèle ou plaque
- `status` : Filtrer par statut (active, maintenance, inactive)
- `type_vehicule` : Filtrer par type

**Exemple** : `/api/admin/cars?status=active&type_vehicule=berline`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "cars": [
      {
        "id": 3,
        "nom_modele": "Toyota Corolla",
        "plaque_immatriculation": "BF-123-AB",
        "type_vehicule": "berline",
        "couleur": "Blanche",
        "annee_fabrication": 2020,
        "kilometrage": 75000,
        "status": "active",
        "driver_nom": "Ouedraogo",
        "driver_prenom": "Mamadou",
        "driver_id": 8
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 38,
      "total_pages": 4
    }
  }
}
```

---

#### 12. Détails d'un véhicule

**GET** `/api/admin/cars/:id`

**URL** : `/api/admin/cars/3`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "car": {
      "id": 3,
      "nom_modele": "Toyota Corolla",
      "plaque_immatriculation": "BF-123-AB",
      "type_vehicule": "berline",
      "couleur": "Blanche",
      "annee_fabrication": 2020,
      "kilometrage": 75000,
      "status": "active",
      "driver_id": 8,
      "driver_nom": "Ouedraogo",
      "driver_prenom": "Mamadou",
      "driver_telephone": "+22670123456"
    },
    "maintenance_history": [
      {
        "id": 25,
        "car_id": 3,
        "type_maintenance": "vidange",
        "description": "Vidange moteur",
        "cout": 45000.00,
        "date_maintenance": "2026-01-15"
      }
    ]
  }
}
```

---

#### 13. Créer un véhicule

**POST** `/api/admin/cars`

**Body** :
```json
{
  "nom_modele": "Honda Accord",
  "plaque_immatriculation": "BF-789-EF",
  "type_vehicule": "berline",
  "couleur": "Noire",
  "annee_fabrication": 2021,
  "kilometrage": 25000,
  "status": "active"
}
```

**Validation** :
- `nom_modele` : Non vide (requis)
- `plaque_immatriculation` : Non vide, unique (requis)
- `type_vehicule` : Non vide (requis)
- `couleur` : Optionnel
- `annee_fabrication` : Entre 1900 et 2030 (optionnel)
- `kilometrage` : Positif (optionnel, défaut: 0)
- `status` : 'active', 'maintenance', ou 'inactive' (optionnel, défaut: 'active')

**Réponse 201** :
```json
{
  "success": true,
  "message": "Véhicule ajouté avec succès",
  "data": {
    "car": {
      "id": 15,
      "nom_modele": "Honda Accord",
      "plaque_immatriculation": "BF-789-EF",
      "type_vehicule": "berline",
      "couleur": "Noire",
      "annee_fabrication": 2021,
      "kilometrage": 25000,
      "status": "active"
    }
  }
}
```

**Erreurs** :
- `400` : Cette plaque d'immatriculation existe déjà

---

#### 14. Modifier un véhicule

**PATCH** `/api/admin/cars/:id`

**URL** : `/api/admin/cars/3`

**Body** (tous les champs sont optionnels) :
```json
{
  "kilometrage": 80000,
  "status": "maintenance"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "message": "Véhicule mis à jour avec succès",
  "data": {
    "car": {
      "id": 3,
      "nom_modele": "Toyota Corolla",
      "plaque_immatriculation": "BF-123-AB",
      "type_vehicule": "berline",
      "couleur": "Blanche",
      "annee_fabrication": 2020,
      "kilometrage": 80000,
      "status": "maintenance"
    }
  }
}
```

**Erreurs** :
- `404` : Véhicule non trouvé
- `400` : Cette plaque d'immatriculation est déjà utilisée

---

#### 15. Supprimer un véhicule

**DELETE** `/api/admin/cars/:id`

**URL** : `/api/admin/cars/3`

**Conditions** :
- Le véhicule ne doit pas être assigné à un chauffeur

**Réponse 200** :
```json
{
  "success": true,
  "message": "Véhicule supprimé avec succès"
}
```

**Erreurs** :
- `404` : Véhicule non trouvé
- `400` : Impossible de supprimer ce véhicule car il est assigné à un chauffeur

---

### Gestion Clients

#### 16. Liste des clients

**GET** `/api/admin/clients`

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 100)
- `search` : Rechercher par nom, prénom, téléphone ou email

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "user_id": 15,
        "nom": "Traoré",
        "prenom": "Amadou",
        "telephone": "+22670888777",
        "lieu_residence": "Ouagadougou",
        "email": "amadou@example.com",
        "created_at": "2025-11-20T08:30:00.000Z",
        "total_rides": 47,
        "total_spent": 132500.00
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 234,
      "total_pages": 24
    }
  }
}
```

---

#### 17. Supprimer un client

**DELETE** `/api/admin/clients/:id`

**URL** : `/api/admin/clients/15`

**Conditions** :
- Le client ne doit pas avoir de courses actives

**Réponse 200** :
```json
{
  "success": true,
  "message": "Client supprimé avec succès"
}
```

**Erreurs** :
- `404` : Client non trouvé
- `400` : Impossible de supprimer ce client car il a des courses en cours

---

### Gestion Maintenance

#### 18. Historique de maintenance

**GET** `/api/admin/maintenance`

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 100)
- `car_id` : Filtrer par véhicule
- `type_maintenance` : Filtrer par type

**Exemple** : `/api/admin/maintenance?car_id=3&type_maintenance=vidange`

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "maintenances": [
      {
        "id": 25,
        "car_id": 3,
        "type_maintenance": "vidange",
        "description": "Vidange moteur + filtre à huile",
        "cout": 45000.00,
        "date_maintenance": "2026-01-15",
        "nom_modele": "Toyota Corolla",
        "plaque_immatriculation": "BF-123-AB",
        "type_vehicule": "berline"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 127,
      "total_pages": 13
    }
  }
}
```

---

#### 19. Ajouter une maintenance

**POST** `/api/admin/maintenance`

**Body** :
```json
{
  "car_id": 3,
  "type_maintenance": "revision",
  "description": "Révision complète 100 000 km",
  "cout": 125000.00,
  "date_maintenance": "2026-02-08"
}
```

**Validation** :
- `car_id` : Entier, véhicule existant (requis)
- `type_maintenance` : Non vide (requis)
- `description` : Optionnel
- `cout` : Nombre positif (requis)
- `date_maintenance` : Format ISO 8601 (optionnel, défaut: aujourd'hui)

**Réponse 201** :
```json
{
  "success": true,
  "message": "Maintenance ajoutée avec succès",
  "data": {
    "maintenance": {
      "id": 128,
      "car_id": 3,
      "type_maintenance": "revision",
      "description": "Révision complète 100 000 km",
      "cout": 125000.00,
      "date_maintenance": "2026-02-08"
    }
  }
}
```

**Erreurs** :
- `404` : Véhicule non trouvé

---

### Gestion Feedbacks

#### 20. Liste des avis

**GET** `/api/admin/feedbacks`

**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Résultats par page (défaut: 10, max: 100)

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "feedbacks": [],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

*Note : Table feedbacks non implémentée*

---

## 🔌 WebSocket (Socket.io)

### Connexion

**URL** : `http://localhost:5000`  
**Protocole** : WebSocket + Polling

**Authentification** :
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'votre_token_jwt'
  }
});
```

### Rooms automatiques

À la connexion, chaque utilisateur rejoint automatiquement :
- `user_${userId}` : Room personnelle
- `drivers` : Si rôle = driver
- `clients` : Si rôle = client

---

### Événements émis par le serveur

#### 1. `new_ride_request`

**Destinataires** : Tous les chauffeurs (room `drivers`)  
**Déclenché par** : Client crée une course

**Données** :
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

**Écouter l'événement** :
```javascript
socket.on('new_ride_request', (data) => {
  console.log('Nouvelle course disponible:', data);
  // Afficher notification au chauffeur
});
```

---

#### 2. `ride_accepted`

**Destinataire** : Le client concerné (room `user_${client_id}`)  
**Déclenché par** : Chauffeur accepte la course

**Données** :
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

**Écouter l'événement** :
```javascript
socket.on('ride_accepted', (data) => {
  console.log('Chauffeur trouvé:', data.driver);
  // Afficher les infos du chauffeur au client
});
```

---

#### 3. `driver_position`

**Destinataire** : Le client de la course active (room `user_${client_id}`)  
**Déclenché par** : Chauffeur envoie sa position GPS

**Données** :
```json
{
  "lat": 12.3714,
  "long": -1.5197,
  "timestamp": "2026-02-08T14:35:00.000Z"
}
```

**Écouter l'événement** :
```javascript
socket.on('driver_position', (data) => {
  console.log('Position chauffeur:', data);
  // Mettre à jour le marqueur sur la carte
  updateDriverMarker(data.lat, data.long);
});
```

---

#### 4. `status_changed`

**Destinataire** : Le client concerné (room `user_${client_id}`)  
**Déclenché par** : Chauffeur change le statut de la course

**Données** :
```json
{
  "ride_id": 42,
  "status": "arrived",
  "message": "Votre chauffeur est arrivé au point de départ !",
  "updated_at": "2026-02-08T14:40:00.000Z"
}
```

**Messages selon le statut** :
- `arrived` → "Votre chauffeur est arrivé au point de départ !"
- `in_progress` → "Votre trajet a commencé"
- `completed` → "Votre trajet est terminé. Merci d'avoir utilisé TaxiTrack !"

**Écouter l'événement** :
```javascript
socket.on('status_changed', (data) => {
  console.log('Statut changé:', data.status);
  showNotification(data.message);
});
```

---

#### 5. `ride_cancelled`

**Destinataire** : Le chauffeur assigné (room `user_${driver_id}`)  
**Déclenché par** : Client annule la course

**Données** :
```json
{
  "ride_id": 42,
  "message": "Le client a annulé la course"
}
```

**Écouter l'événement** :
```javascript
socket.on('ride_cancelled', (data) => {
  console.log('Course annulée:', data);
  // Libérer le chauffeur
});
```

---

### Événements reçus par le serveur

#### `update_location`

**Émetteur** : Chauffeur  
**But** : Mettre à jour la position GPS en temps réel

**Données à envoyer** :
```json
{
  "lat": 12.3714,
  "long": -1.5197
}
```

**Envoyer l'événement** :
```javascript
socket.emit('update_location', {
  lat: 12.3714,
  long: -1.5197
});
```

**Effet** :
1. Met à jour `driver_profiles.current_lat` et `current_long`
2. Si course active, émet `driver_position` au client

---

### Gestion des événements de connexion

```javascript
socket.on('connect', () => {
  console.log('Connecté au serveur WebSocket');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Déconnecté:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Erreur de connexion:', error);
});
```

---

## ⚠️ Codes d'erreur

### Erreurs HTTP

| Code | Signification | Description |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Données invalides ou règle métier violée |
| `401` | Unauthorized | Token manquant, invalide ou expiré |
| `403` | Forbidden | Accès interdit (mauvais rôle) |
| `404` | Not Found | Ressource non trouvée |
| `500` | Internal Server Error | Erreur serveur |

---

### Format des erreurs

**Erreur de validation** :
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "type": "field",
      "msg": "Email invalide",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Erreur métier** :
```json
{
  "success": false,
  "message": "Vous avez déjà une course en cours"
}
```

**Erreur serveur** :
```json
{
  "success": false,
  "message": "Erreur serveur"
}
```

---

## 📚 Exemples d'utilisation

### Scénario complet : Client demande une course

#### 1. Client se connecte

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "Password123!"
  }'
```

**Récupère le token** : `eyJhbGciOiJI...`

---

#### 2. Client demande une course

```bash
curl -X POST http://localhost:5000/api/client/rides/request \
  -H "Authorization: Bearer eyJhbGciOiJI..." \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_address": "Place des Nations Unies",
    "pickup_lat": 12.3714,
    "pickup_long": -1.5197,
    "dest_address": "Aéroport de Ouagadougou",
    "dest_lat": 12.3532,
    "dest_long": -1.5124
  }'
```

**Résultat** : Course créée, ID = 42

**WebSocket** : Tous les chauffeurs reçoivent `new_ride_request`

---

#### 3. Chauffeur accepte la course

```bash
curl -X POST http://localhost:5000/api/driver/rides/42/accept \
  -H "Authorization: Bearer <token_driver>"
```

**WebSocket** : Le client reçoit `ride_accepted` avec les infos du chauffeur

---

#### 4. Chauffeur envoie sa position GPS

```javascript
// Côté chauffeur (app mobile)
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('update_location', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    });
  });
}, 5000); // Toutes les 5 secondes
```

**WebSocket** : Le client reçoit `driver_position` toutes les 5 secondes

---

#### 5. Chauffeur arrive au point de départ

```bash
curl -X PATCH http://localhost:5000/api/driver/rides/42/status \
  -H "Authorization: Bearer <token_driver>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "arrived"
  }'
```

**WebSocket** : Client reçoit `status_changed` avec message "Votre chauffeur est arrivé..."

---

#### 6. Trajet commence

```bash
curl -X PATCH http://localhost:5000/api/driver/rides/42/status \
  -H "Authorization: Bearer <token_driver>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**WebSocket** : Client reçoit `status_changed` avec message "Votre trajet a commencé"

---

#### 7. Trajet terminé

```bash
curl -X PATCH http://localhost:5000/api/driver/rides/42/status \
  -H "Authorization: Bearer <token_driver>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**WebSocket** : Client reçoit `status_changed` avec message "Votre trajet est terminé..."

---

### Scénario : Admin gère les chauffeurs

#### 1. Admin se connecte

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taxitrack.com",
    "password": "Admin123!"
  }'
```

---

#### 2. Admin consulte les statistiques

```bash
curl -X GET http://localhost:5000/api/admin/stats/drivers \
  -H "Authorization: Bearer <token_admin>"
```

---

#### 3. Admin crée un nouveau chauffeur

```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau.driver@example.com",
    "password": "Driver123!",
    "nom": "Sawadogo",
    "prenom": "Ibrahim",
    "telephone": "+22670555444",
    "lieu_residence": "Bobo-Dioulasso",
    "car_id": 5
  }'
```

---

#### 4. Admin ajoute un véhicule

```bash
curl -X POST http://localhost:5000/api/admin/cars \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom_modele": "Toyota Camry",
    "plaque_immatriculation": "BF-999-ZZ",
    "type_vehicule": "berline",
    "couleur": "Grise",
    "annee_fabrication": 2022,
    "kilometrage": 5000,
    "status": "active"
  }'
```

---

#### 5. Admin enregistre une maintenance

```bash
curl -X POST http://localhost:5000/api/admin/maintenance \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "car_id": 3,
    "type_maintenance": "vidange",
    "description": "Vidange complète + filtres",
    "cout": 45000,
    "date_maintenance": "2026-02-08"
  }'
```

---

## 🔒 Sécurité

### Recommandations pour la production

1. **Variables d'environnement**
   - Changez `JWT_SECRET` par une valeur aléatoire forte
   - Utilisez des mots de passe forts en base de données
   - Ne commitez JAMAIS le fichier `.env`

2. **CORS**
   - Restreignez `ALLOWED_ORIGINS` aux domaines autorisés
   - Ne laissez pas `*` en production

3. **Rate Limiting**
   - Ajoutez express-rate-limit pour limiter les tentatives de connexion
   - Protégez les endpoints sensibles

4. **HTTPS**
   - Utilisez obligatoirement HTTPS en production
   - Configurez les certificats SSL/TLS

5. **Socket.io CORS**
   - Dans `src/config/socket.js`, changez :
   ```javascript
   cors: {
     origin: process.env.ALLOWED_ORIGINS?.split(','),
     // ...
   }
   ```

---

## 📞 Support

**Documentation** : Ce fichier  
**Code source** : `/backend`  
**Tests** : Collection Postman (voir fichier séparé)

---

**Version** : 1.0.0  
**Dernière mise à jour** : 8 février 2026  
**Auteur** : TaxiTrack Team