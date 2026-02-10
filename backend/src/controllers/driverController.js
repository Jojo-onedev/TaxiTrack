const pool = require('../config/database');

/**
 * PATCH /api/driver/status
 * Mettre à jour le statut en ligne/hors ligne du chauffeur
 */
const updateOnlineStatus = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { is_online } = req.body;

    // Mettre à jour le statut
    await pool.query(
      `UPDATE driver_profiles 
       SET is_online = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [is_online, driverId]
    );

    res.json({
      success: true,
      message: `Vous êtes maintenant ${is_online ? 'en ligne' : 'hors ligne'}`,
      data: {
        is_online
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/driver/rides/available
 * Récupérer les courses disponibles à proximité (status = pending)
 */
const getAvailableRides = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    // Récupérer la position actuelle du chauffeur
    const driverPos = await pool.query(
      `SELECT current_lat, current_long 
       FROM driver_profiles 
       WHERE user_id = $1`,
      [driverId]
    );

    // Récupérer toutes les courses en attente
    const result = await pool.query(
      `SELECT 
        r.id, r.depart_lat, r.depart_long, r.depart_address,
        r.dest_lat, r.dest_long, r.dest_address,
        r.prix, r.created_at,
        cp.nom, cp.prenom, cp.telephone
       FROM rides r
       JOIN client_profiles cp ON r.client_id = cp.user_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC
       LIMIT 20`
    );

    const rides = result.rows.map(ride => {
      // Si le chauffeur a une position, calculer la distance
      let distance_from_driver = null;
      if (driverPos.rows[0]?.current_lat && driverPos.rows[0]?.current_long) {
        distance_from_driver = calculateDistance(
          parseFloat(driverPos.rows[0].current_lat),
          parseFloat(driverPos.rows[0].current_long),
          parseFloat(ride.depart_lat),
          parseFloat(ride.depart_long)
        ).toFixed(2);
      }

      return {
        id: ride.id,
        client: {
          name: `${ride.prenom} ${ride.nom}`,
          phone: ride.telephone
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
        distance_from_driver: distance_from_driver ? `${distance_from_driver} km` : 'N/A',
        created_at: ride.created_at
      };
    });

    res.json({
      success: true,
      data: {
        rides,
        total: rides.length
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/driver/rides/:id/accept
 * Accepter une course
 */
const acceptRide = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const driverId = req.user.id;
    const rideId = req.params.id;

    await client.query('BEGIN');

    // Vérifier que la course existe et est disponible
    const rideCheck = await client.query(
      `SELECT id, status, client_id FROM rides WHERE id = $1`,
      [rideId]
    );

    if (rideCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Course non trouvée'
      });
    }

    if (rideCheck.rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cette course n\'est plus disponible'
      });
    }

    // Assigner le chauffeur et changer le statut
    const result = await client.query(
      `UPDATE rides 
       SET driver_id = $1, status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [driverId, rideId]
    );

    await client.query('COMMIT');

    const ride = result.rows[0];

    // Récupérer les infos du chauffeur pour la notification (Utiliser POOL car hors transaction maintenant)
    const driverInfo = await pool.query(
      `SELECT dp.nom, dp.prenom, dp.telephone, 
              c.nom_modele, c.plaque_immatriculation
       FROM driver_profiles dp
       LEFT JOIN cars c ON dp.car_id = c.id
       WHERE dp.user_id = $1`,
      [driverId]
    );

    const driver = driverInfo.rows[0];

    // Notifier le client via Socket.io
    const io = req.io;
    if (io && driver) {
      io.to(`user_${ride.client_id}`).emit('ride_accepted', {
        ride_id: ride.id,
        driver: {
          name: `${driver.prenom || ''} ${driver.nom || ''}`.trim() || 'Un chauffeur',
          phone: driver.telephone,
          car: {
            model: driver.nom_modele,
            plate: driver.plaque_immatriculation
          }
        },
        message: 'Un chauffeur a accepté votre course !'
      });
      console.log(`📢 Client ${ride.client_id} notifié : chauffeur accepté`);
    }

    res.json({
      success: true,
      message: 'Course acceptée avec succès',
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
          price: parseFloat(ride.prix)
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/driver/rides/:id/update-status
 * Mettre à jour le statut d'une course (arrived, in_progress, completed)
 */
const updateRideStatus = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const rideId = req.params.id;
    const { status } = req.body;

    // Vérifier que le statut est valide
    const validStatuses = ['arrived', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées: arrived, in_progress, completed'
      });
    }

    // Vérifier que la course appartient au chauffeur
    const rideCheck = await pool.query(
      `SELECT id, status FROM rides 
       WHERE id = $1 AND driver_id = $2`,
      [rideId, driverId]
    );

    if (rideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course non trouvée ou vous n\'êtes pas assigné à cette course'
      });
    }

    // Mettre à jour le statut
    const updateQuery = status === 'completed'
      ? `UPDATE rides 
         SET status = $1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`
      : `UPDATE rides 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`;

    const result = await pool.query(updateQuery, [status, rideId]);
    const ride = result.rows[0];

    // Notifier le client du changement de statut
    const io = req.io;
    const messages = {
      'arrived': 'Votre chauffeur est arrivé au point de départ !',
      'in_progress': 'Votre trajet a commencé',
      'completed': 'Votre trajet est terminé. Merci d\'avoir utilisé TaxiTrack !'
    };

    io.to(`user_${ride.client_id}`).emit('status_changed', {
      ride_id: ride.id,
      status: status,
      message: messages[status] || 'Statut de la course mis à jour',
      updated_at: ride.updated_at
    });

    console.log(`📢 Client ${ride.client_id} notifié : statut ${status}`);

    res.json({
      success: true,
      message: `Statut mis à jour: ${status}`,
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
          updated_at: ride.updated_at,
          completed_at: ride.completed_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/driver/stats/summary
 * Récupérer les statistiques du chauffeur
 */
const getDriverStats = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    // Revenus du jour
    const todayEarnings = await pool.query(
      `SELECT COALESCE(SUM(prix), 0) as earned_today
       FROM rides
       WHERE driver_id = $1 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [driverId]
    );

    // Note moyenne
    const avgRating = await pool.query(
      `SELECT COALESCE(AVG(feedback_score), 0) as rating
       FROM rides
       WHERE driver_id = $1 
       AND feedback_score IS NOT NULL`,
      [driverId]
    );

    // Nombre total de courses
    const totalRides = await pool.query(
      `SELECT COUNT(*) as total
       FROM rides
       WHERE driver_id = $1 
       AND status = 'completed'`,
      [driverId]
    );

    res.json({
      success: true,
      data: {
        total_earnings: parseFloat(todayEarnings.rows[0].earned_today), // Renamed for frontend compatibility
        average_rating: parseFloat(avgRating.rows[0].rating).toFixed(1), // Renamed for frontend compatibility
        total_rides: parseInt(totalRides.rows[0].total)
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/driver/car
 * Récupérer les infos du véhicule assigné
 */
const getDriverCar = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const result = await pool.query(
      `SELECT c.id, c.nom_modele, c.plaque_immatriculation, c.status
       FROM driver_profiles dp
       JOIN cars c ON dp.car_id = c.id
       WHERE dp.user_id = $1`,
      [driverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun véhicule assigné'
      });
    }

    const car = result.rows[0];

    res.json({
      success: true,
      data: {
        car: {
          id: car.id,
          model: car.nom_modele,
          plate: car.plaque_immatriculation,
          status: car.status
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Fonction utilitaire : Calculer la distance entre 2 points GPS
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
 * GET /api/driver/rides/history
 * Récupérer l'historique des courses terminées
 */
const getDriverRideHistory = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        r.id, r.depart_address, r.dest_address,
        r.prix, r.created_at, r.completed_at, r.status,
        cp.nom, cp.prenom
       FROM rides r
       JOIN client_profiles cp ON r.client_id = cp.user_id
       WHERE r.driver_id = $1
       AND r.status IN ('completed', 'cancelled')
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [driverId, limit, offset]
    );

    const rides = result.rows.map(ride => ({
      id: ride.id,
      client_name: `${ride.prenom} ${ride.nom}`,
      pickup: ride.depart_address,
      destination: ride.dest_address,
      price: parseFloat(ride.prix),
      date: ride.created_at,
      status: ride.status
    }));

    res.json({
      success: true,
      data: { rides }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/driver/earnings/history
 * Récupérer l'historique des gains (par jour)
 */
const getDriverEarningsHistory = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    // Gains par jour sur les 30 derniers jours
    const result = await pool.query(
      `SELECT 
        DATE(completed_at) as date,
        SUM(prix) as total_amount,
        COUNT(*) as total_rides
       FROM rides
       WHERE driver_id = $1 
       AND status = 'completed'
       AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(completed_at)
       ORDER BY DATE(completed_at) DESC`,
      [driverId]
    );

    const earnings = result.rows.map(row => ({
      date: row.date,
      amount: parseFloat(row.total_amount),
      rides_count: parseInt(row.total_rides)
    }));

    res.json({
      success: true,
      data: { earnings }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateOnlineStatus,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverStats,
  getDriverCar,
  getDriverRideHistory,
  getDriverEarningsHistory
};