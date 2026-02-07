const pool = require('../config/database');

/**
 * POST /api/client/rides/request
 * Créer une nouvelle demande de course
 */

const requestRide = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const clientId = req.user.id;

    // Récupérer le profil du client pour les notifications
    const profileResult = await pool.query(
      'SELECT nom, prenom FROM client_profiles WHERE user_id = $1',
      [clientId]
    );
    const profile = profileResult.rows[0];

    const { 
      pickup_address, 
      pickup_lat, 
      pickup_long, 
      dest_address, 
      dest_lat, 
      dest_long 
    } = req.body;

    // Vérifier qu'il n'y a pas déjà une course active pour ce client
    const activeRide = await client.query(
      `SELECT id FROM rides 
       WHERE client_id = $1 
       AND status IN ('pending', 'accepted', 'arrived', 'in_progress')`,
      [clientId]
    );

    if (activeRide.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une course en cours'
      });
    }

    // Calculer le prix estimé
    const distance = calculateDistance(pickup_lat, pickup_long, dest_lat, dest_long);
    const estimatedPrice = 500 + (distance * 200);

    // Créer la course
    const result = await client.query(
      `INSERT INTO rides (
        client_id, 
        depart_lat, depart_long, depart_address,
        dest_lat, dest_long, dest_address,
        status, prix
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      RETURNING *`,
      [
        clientId,
        pickup_lat, pickup_long, pickup_address,
        dest_lat, dest_long, dest_address,
        estimatedPrice
      ]
    );

    const ride = result.rows[0];

    // Notifier tous les chauffeurs en ligne via Socket.io
    if (req.io) {
      req.io.to('drivers').emit('new_ride_request', {
        ride_id: ride.id,
        client: {
          name: `${profile?.prenom || 'Client'} ${profile?.nom || ''}`.trim()
        },
        pickup: {
          address: ride.depart_address,
          lat: parseFloat(ride.depart_lat),
          long: parseFloat(ride.depart_long)
        },
        destination: {
          address: ride.dest_address,
          lat: parseFloat(ride.dest_lat),
          long: parseFloat(ride.dest_long)
        },
        price: parseFloat(ride.prix),
        created_at: ride.created_at
      });
      console.log(`Notification envoyée aux chauffeurs pour la course ${ride.id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Demande de course créée avec succès',
      data: {
        ride: {
          id: ride.id,
          pickup: {
            address: ride.depart_address,
            lat: parseFloat(ride.depart_lat),
            long: parseFloat(ride.depart_long)
          },
          destination: {
            address: ride.dest_address,
            lat: parseFloat(ride.dest_lat),
            long: parseFloat(ride.dest_long)
          },
          status: ride.status,
          estimated_price: parseFloat(ride.prix),
          distance_km: distance.toFixed(2),
          created_at: ride.created_at
        }
      }
    });

  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/client/rides/active
 * Récupérer la course active du client
 */
const getActiveRide = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    const result = await pool.query(
      `SELECT 
        r.*,
        dp.nom as driver_nom, 
        dp.prenom as driver_prenom,
        dp.telephone as driver_telephone,
        c.nom_modele as car_model,
        c.plaque_immatriculation as car_plate
       FROM rides r
       LEFT JOIN driver_profiles dp ON r.driver_id = dp.user_id
       LEFT JOIN cars c ON dp.car_id = c.id
       WHERE r.client_id = $1 
       AND r.status IN ('pending', 'accepted', 'arrived', 'in_progress')
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Aucune course active'
      });
    }

    const ride = result.rows[0];

    res.json({
      success: true,
      data: {
        ride: {
          id: ride.id,
          status: ride.status,
          pickup: {
            address: ride.depart_address,
            lat: parseFloat(ride.depart_lat),
            long: parseFloat(ride.depart_long)
          },
          destination: {
            address: ride.dest_address,
            lat: parseFloat(ride.dest_lat),
            long: parseFloat(ride.dest_long)
          },
          price: parseFloat(ride.prix),
          driver: ride.driver_id ? {
            name: `${ride.driver_prenom} ${ride.driver_nom}`,
            phone: ride.driver_telephone,
            car: {
              model: ride.car_model,
              plate: ride.car_plate
            }
          } : null,
          created_at: ride.created_at,
          updated_at: ride.updated_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client/rides/history
 * Récupérer l'historique des courses du client
 */
const getRideHistory = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        r.*,
        dp.nom as driver_nom, 
        dp.prenom as driver_prenom
       FROM rides r
       LEFT JOIN driver_profiles dp ON r.driver_id = dp.user_id
       WHERE r.client_id = $1 
       AND r.status IN ('completed', 'cancelled')
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [clientId, limit, offset]
    );

    // Compter le total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM rides 
       WHERE client_id = $1 
       AND status IN ('completed', 'cancelled')`,
      [clientId]
    );

    const rides = result.rows.map(ride => ({
      id: ride.id,
      status: ride.status,
      pickup: {
        address: ride.depart_address,
        lat: parseFloat(ride.depart_lat),
        long: parseFloat(ride.depart_long)
      },
      destination: {
        address: ride.dest_address,
        lat: parseFloat(ride.dest_lat),
        long: parseFloat(ride.dest_long)
      },
      price: parseFloat(ride.prix),
      driver: ride.driver_id ? `${ride.driver_prenom} ${ride.driver_nom}` : null,
      rating: ride.feedback_score,
      date: ride.completed_at || ride.created_at
    }));

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].count / limit),
          total_rides: parseInt(countResult.rows[0].count),
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/client/rides/:id/rating
 * Noter une course terminée
 */
const rateRide = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const rideId = req.params.id;
    const { rating, comment } = req.body;

    // Vérifier que la course appartient au client et est terminée
    const rideCheck = await pool.query(
      `SELECT id, status FROM rides 
       WHERE id = $1 AND client_id = $2`,
      [rideId, clientId]
    );

    if (rideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course non trouvée'
      });
    }

    if (rideCheck.rows[0].status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez noter qu\'une course terminée'
      });
    }

    // Mettre à jour la note
    await pool.query(
      `UPDATE rides 
       SET feedback_score = $1, feedback_comment = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [rating, comment, rideId]
    );

    res.json({
      success: true,
      message: 'Merci pour votre avis !',
      data: {
        ride_id: parseInt(rideId),
        rating,
        comment
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Fonction utilitaire : Calculer la distance entre 2 points GPS (formule Haversine)
 * Retourne la distance en kilomètres
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * POST /api/client/rides/:id/cancel
 * Annuler une course
 */
const cancelRide = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const rideId = req.params.id;

    // Vérifier que la course appartient au client
    const rideCheck = await pool.query(
      `SELECT id, status FROM rides 
       WHERE id = $1 AND client_id = $2`,
      [rideId, clientId]
    );

    if (rideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course non trouvée'
      });
    }

    const ride = rideCheck.rows[0];

    // Vérifier que la course peut être annulée (seulement pending ou accepted)
    if (!['pending', 'accepted'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette course ne peut plus être annulée (trajet déjà commencé ou terminé)'
      });
    }

    // Annuler la course
    await pool.query(
      `UPDATE rides 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [rideId]
    );

    // Notifier tous les chauffeurs en ligne via Socket.io
const io = req.io;
io.to('drivers').emit('new_ride_request', {
  ride_id: ride.id,
  client: {
    name: `${profile?.prenom || 'Client'} ${profile?.nom || ''}`.trim()
  },
  pickup: {
    address: ride.depart_address,
    lat: parseFloat(ride.depart_lat),
    long: parseFloat(ride.depart_long)
  },
  destination: {
    address: ride.dest_address,
    lat: parseFloat(ride.dest_lat),
    long: parseFloat(ride.dest_long)
  },
  price: parseFloat(ride.prix),
  created_at: ride.created_at
});
console.log(`Notification envoyée aux chauffeurs pour la course ${ride.id}`);

    res.json({
      success: true,
      message: 'Course annulée avec succès',
      data: {
        ride_id: parseInt(rideId),
        status: 'cancelled'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestRide,
  getActiveRide,
  getRideHistory,
  rateRide,
  cancelRide
};