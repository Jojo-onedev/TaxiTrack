const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// ============================================
// STATISTIQUES - Dashboard
// ============================================

/**
 * GET /api/admin/stats/drivers
 * Statistiques globales des chauffeurs
 */
const getDriverStats = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_drivers,
        COUNT(DISTINCT car_id) FILTER (WHERE car_id IS NOT NULL) as drivers_with_car
      FROM driver_profiles
    `);

    // Chauffeurs les plus actifs (top 5)
    const topDrivers = await pool.query(`
      SELECT 
        dp.user_id,
        dp.nom,
        dp.prenom,
        dp.telephone,
        COUNT(r.id) as total_rides,
        COALESCE(SUM(r.prix), 0) as total_earnings
      FROM driver_profiles dp
      LEFT JOIN rides r ON r.driver_id = dp.user_id AND r.status = 'completed'
      GROUP BY dp.user_id, dp.nom, dp.prenom, dp.telephone
      ORDER BY total_rides DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_drivers: topDrivers.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/vehicles
 * Statistiques des véhicules
 */
const getVehicleStats = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_vehicles,
        COUNT(*) FILTER (WHERE status = 'active') as active_vehicles,
        COUNT(*) FILTER (WHERE status = 'maintenance') as in_maintenance,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_vehicles
      FROM cars
    `);

    // Véhicules par type
    const byType = await pool.query(`
      SELECT 
        type_vehicule,
        COUNT(*) as count
      FROM cars
      GROUP BY type_vehicule
      ORDER BY count DESC
    `);

    // Véhicules nécessitant maintenance prochainement
    const maintenanceSoon = await pool.query(`
      SELECT 
        c.id,
        c.nom_modele,
        c.plaque_immatriculation,
        c.kilometrage,
        MAX(m.date_maintenance) as last_maintenance
      FROM cars c
      LEFT JOIN maintenance m ON m.car_id = c.id
      WHERE c.status = 'active'
      GROUP BY c.id, c.nom_modele, c.plaque_immatriculation, c.kilometrage
      ORDER BY last_maintenance ASC NULLS FIRST
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        by_type: byType.rows,
        maintenance_needed: maintenanceSoon.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/clients
 * Statistiques des clients
 */
const getClientStats = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (
          WHERE user_id IN (
            SELECT DISTINCT client_id FROM rides 
            WHERE created_at >= NOW() - INTERVAL '30 days'
          )
        ) as active_last_30_days
      FROM client_profiles
    `);

    // Clients les plus actifs
    const topClients = await pool.query(`
      SELECT 
        cp.user_id,
        cp.nom,
        cp.prenom,
        cp.telephone,
        COUNT(r.id) as total_rides,
        COALESCE(SUM(r.prix), 0) as total_spent
      FROM client_profiles cp
      LEFT JOIN rides r ON r.client_id = cp.user_id
      GROUP BY cp.user_id, cp.nom, cp.prenom, cp.telephone
      ORDER BY total_rides DESC
      LIMIT 5
    `);

    // Nouveaux clients par mois (6 derniers mois)
    const newClientsByMonth = await pool.query(`
      SELECT 
        TO_CHAR(u.created_at, 'YYYY-MM') as month,
        COUNT(*) as new_clients
      FROM users u
      WHERE u.role = 'client' 
        AND u.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(u.created_at, 'YYYY-MM')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_clients: topClients.rows,
        new_clients_trend: newClientsByMonth.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/maintenance
 * Statistiques de maintenance
 */
const getMaintenanceStats = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_maintenances,
        COUNT(*) FILTER (WHERE date_maintenance >= NOW() - INTERVAL '30 days') as last_30_days,
        COALESCE(SUM(cout), 0) as total_cost,
        COALESCE(AVG(cout), 0) as average_cost
      FROM maintenance
    `);

    // Maintenance par type
    const byType = await pool.query(`
      SELECT 
        type_maintenance,
        COUNT(*) as count,
        COALESCE(SUM(cout), 0) as total_cost
      FROM maintenance
      GROUP BY type_maintenance
      ORDER BY count DESC
    `);

    // Dernières maintenances
    const recent = await pool.query(`
      SELECT 
        m.id,
        m.type_maintenance,
        m.description,
        m.cout,
        m.date_maintenance,
        c.nom_modele,
        c.plaque_immatriculation
      FROM maintenance m
      JOIN cars c ON c.id = m.car_id
      ORDER BY m.date_maintenance DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        by_type: byType.rows,
        recent_maintenances: recent.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/feedbacks
 * Statistiques des avis clients
 */
const getFeedbackStats = async (req, res, next) => {
  try {
    const stats = {
      total_feedbacks: 0,
      average_rating: 0,
      five_stars: 0,
      four_stars: 0,
      three_stars: 0,
      two_stars: 0,
      one_star: 0
    };

    res.json({
      success: true,
      data: {
        overview: stats,
        recent_feedbacks: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GESTION DES CHAUFFEURS
// ============================================

/**
 * GET /api/admin/drivers
 * Liste des chauffeurs avec filtres et pagination
 */
const getDrivers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      has_car 
    } = req.query;

    const offset = (page - 1) * limit;

    // Construction de la requête avec filtres
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filtre recherche (nom, prenom, telephone)
    if (search) {
      whereConditions.push(`(
        dp.nom ILIKE $${paramIndex} OR 
        dp.prenom ILIKE $${paramIndex} OR 
        dp.telephone ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtre présence véhicule
    if (has_car !== undefined) {
      if (has_car === 'true') {
        whereConditions.push(`dp.car_id IS NOT NULL`);
      } else {
        whereConditions.push(`dp.car_id IS NULL`);
      }
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Compter le total
    const countQuery = `
      SELECT COUNT(*) 
      FROM driver_profiles dp
      ${whereClause}
    `;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count);

    // Récupérer les chauffeurs
    queryParams.push(limit, offset);
    const driversQuery = `
      SELECT 
        dp.user_id,
        dp.nom,
        dp.prenom,
        dp.telephone,
        dp.lieu_residence,
        dp.car_id,
        dp.cnib,
        dp.date_entree,
        u.email,
        u.created_at,
        c.nom_modele as car_model,
        c.plaque_immatriculation as car_plate,
        COUNT(r.id) as total_rides,
        COALESCE(SUM(r.prix) FILTER (WHERE r.status = 'completed'), 0) as total_earnings
      FROM driver_profiles dp
      JOIN users u ON u.id = dp.user_id
      LEFT JOIN cars c ON c.id = dp.car_id
      LEFT JOIN rides r ON r.driver_id = dp.user_id
      ${whereClause}
      GROUP BY dp.user_id, dp.nom, dp.prenom, dp.telephone, dp.lieu_residence,
               dp.car_id, dp.cnib, dp.date_entree, u.email, u.created_at, 
               c.nom_modele, c.plaque_immatriculation
      ORDER BY dp.user_id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const driversResult = await pool.query(driversQuery, queryParams);

    res.json({
      success: true,
      data: {
        drivers: driversResult.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/drivers/:id
 * Détails d'un chauffeur
 */
const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const driverQuery = `
      SELECT 
        dp.user_id,
        dp.nom,
        dp.prenom,
        dp.telephone,
        dp.lieu_residence,
        dp.car_id,
        dp.cnib,
        dp.date_entree,
        u.email,
        u.created_at,
        c.nom_modele,
        c.plaque_immatriculation,
        c.type_vehicule,
        c.couleur,
        c.annee_fabrication,
        c.kilometrage,
        c.status as car_status
      FROM driver_profiles dp
      JOIN users u ON u.id = dp.user_id
      LEFT JOIN cars c ON c.id = dp.car_id
      WHERE dp.user_id = $1
    `;

    const driverResult = await pool.query(driverQuery, [id]);

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé'
      });
    }

    // Statistiques du chauffeur
    const statsQuery = `
      SELECT 
        COUNT(*) as total_rides,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_rides,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_rides,
        COALESCE(SUM(prix) FILTER (WHERE status = 'completed'), 0) as total_earnings,
        COALESCE(AVG(prix) FILTER (WHERE status = 'completed'), 0) as average_ride_price
      FROM rides
      WHERE driver_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [id]);

    // Dernières courses
    const ridesQuery = `
      SELECT 
        r.id,
        r.depart_address,
        r.dest_address,
        r.prix,
        r.status,
        r.created_at,
        r.updated_at,
        cp.nom as client_nom,
        cp.prenom as client_prenom
      FROM rides r
      JOIN client_profiles cp ON cp.user_id = r.client_id
      WHERE r.driver_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const ridesResult = await pool.query(ridesQuery, [id]);

    res.json({
      success: true,
      data: {
        driver: driverResult.rows[0],
        statistics: statsResult.rows[0],
        recent_rides: ridesResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/drivers
 * Créer un nouveau chauffeur
 */
const createDriver = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const {
      email,
      password,
      nom,
      prenom,
      telephone,
      lieu_residence,
      car_id,
      cnib,
      date_entree  
    } = req.body;

    await client.query('BEGIN');

    // Vérifier si l'email existe déjà
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Si car_id fourni, vérifier qu'il n'est pas déjà assigné
    if (car_id) {
      const carCheck = await client.query(
        'SELECT id FROM driver_profiles WHERE car_id = $1',
        [car_id]
      );

      if (carCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Ce véhicule est déjà assigné à un autre chauffeur'
        });
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'driver')
       RETURNING id, email, role, created_at`,
      [email, hashedPassword]
    );

    const userId = userResult.rows[0].id;

    // Créer le profil chauffeur
    const profileResult = await client.query(
      `INSERT INTO driver_profiles (
        user_id, nom, prenom, telephone, lieu_residence, car_id, cnib, date_entree  
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [userId, nom, prenom, telephone, lieu_residence, car_id || null, cnib, date_entree]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Chauffeur créé avec succès',
      data: {
        user: userResult.rows[0],
        profile: profileResult.rows[0]
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
 * PATCH /api/admin/drivers/:id
 * Modifier un chauffeur
 */
const updateDriver = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      nom,
      prenom,
      telephone,
      lieu_residence,
      car_id
    } = req.body;

    await client.query('BEGIN');

    // Vérifier que le chauffeur existe
    const driverExists = await client.query(
      'SELECT user_id FROM driver_profiles WHERE user_id = $1',
      [id]
    );

    if (driverExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé'
      });
    }

    // Si car_id change, vérifier qu'il n'est pas déjà assigné
    if (car_id !== undefined && car_id !== null) {
      const carCheck = await client.query(
        'SELECT user_id FROM driver_profiles WHERE car_id = $1 AND user_id != $2',
        [car_id, id]
      );

      if (carCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Ce véhicule est déjà assigné à un autre chauffeur'
        });
      }
    }

    // Construire la requête UPDATE dynamiquement
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nom !== undefined) {
      updates.push(`nom = $${paramIndex}`);
      values.push(nom);
      paramIndex++;
    }
    if (prenom !== undefined) {
      updates.push(`prenom = $${paramIndex}`);
      values.push(prenom);
      paramIndex++;
    }
    if (telephone !== undefined) {
      updates.push(`telephone = $${paramIndex}`);
      values.push(telephone);
      paramIndex++;
    }
    if (lieu_residence !== undefined) {
      updates.push(`lieu_residence = $${paramIndex}`);
      values.push(lieu_residence);
      paramIndex++;
    }
    if (car_id !== undefined) {
      updates.push(`car_id = $${paramIndex}`);
      values.push(car_id || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);
    const updateQuery = `
      UPDATE driver_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Chauffeur mis à jour avec succès',
      data: {
        profile: result.rows[0]
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
 * DELETE /api/admin/drivers/:id
 * Supprimer un chauffeur
 */
const deleteDriver = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Vérifier s'il a des courses en cours
    const activeRides = await client.query(
      `SELECT id FROM rides 
       WHERE driver_id = $1 
       AND status IN ('pending', 'accepted', 'arrived', 'in_progress')`,
      [id]
    );

    if (activeRides.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce chauffeur car il a des courses en cours'
      });
    }

    // Supprimer le profil chauffeur
    const profileResult = await client.query(
      'DELETE FROM driver_profiles WHERE user_id = $1 RETURNING user_id',
      [id]
    );

    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé'
      });
    }

    // Supprimer l'utilisateur
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Chauffeur supprimé avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// ============================================
// GESTION DES VÉHICULES
// ============================================

/**
 * GET /api/admin/cars
 * Liste des véhicules avec filtres et pagination
 */
const getCars = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status,
      type_vehicule 
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filtre recherche
    if (search) {
      whereConditions.push(`(
        c.nom_modele ILIKE $${paramIndex} OR 
        c.plaque_immatriculation ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtre statut
    if (status) {
      whereConditions.push(`c.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Filtre type
    if (type_vehicule) {
      whereConditions.push(`c.type_vehicule = $${paramIndex}`);
      queryParams.push(type_vehicule);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Compter le total
    const countQuery = `SELECT COUNT(*) FROM cars c ${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count);

    // Récupérer les véhicules
    queryParams.push(limit, offset);
    const carsQuery = `
      SELECT 
        c.*,
        dp.nom as driver_nom,
        dp.prenom as driver_prenom,
        dp.user_id as driver_id
      FROM cars c
      LEFT JOIN driver_profiles dp ON dp.car_id = c.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const carsResult = await pool.query(carsQuery, queryParams);

    res.json({
      success: true,
      data: {
        cars: carsResult.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/cars/:id
 * Détails d'un véhicule
 */
const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const carQuery = `
      SELECT 
        c.*,
        dp.user_id as driver_id,
        dp.nom as driver_nom,
        dp.prenom as driver_prenom,
        dp.telephone as driver_telephone
      FROM cars c
      LEFT JOIN driver_profiles dp ON dp.car_id = c.id
      WHERE c.id = $1
    `;

    const carResult = await pool.query(carQuery, [id]);

    if (carResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Historique de maintenance
    const maintenanceQuery = `
      SELECT *
      FROM maintenance
      WHERE car_id = $1
      ORDER BY date_maintenance DESC
      LIMIT 10
    `;
    const maintenanceResult = await pool.query(maintenanceQuery, [id]);

    res.json({
      success: true,
      data: {
        car: carResult.rows[0],
        maintenance_history: maintenanceResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/cars
 * Ajouter un nouveau véhicule
 */
const createCar = async (req, res, next) => {
  try {
    const {
      nom_modele,
      plaque_immatriculation,
      status
    } = req.body;

    // Vérifier que la plaque n'existe pas déjà
    const existingCar = await pool.query(
      'SELECT id FROM cars WHERE plaque_immatriculation = $1',
      [plaque_immatriculation]
    );

    if (existingCar.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cette plaque d\'immatriculation existe déjà'
      });
    }

    const result = await pool.query(
      `INSERT INTO cars (nom_modele, plaque_immatriculation, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        nom_modele,
        plaque_immatriculation,
        status || 'active'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Véhicule ajouté avec succès',
      data: {
        car: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/cars/:id
 * Modifier un véhicule
 */
const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nom_modele,
      plaque_immatriculation,
      status
    } = req.body;

    // Vérifier que le véhicule existe
    const carExists = await pool.query(
      'SELECT id FROM cars WHERE id = $1',
      [id]
    );

    if (carExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Si plaque change, vérifier qu'elle n'est pas déjà utilisée
    if (plaque_immatriculation) {
      const plateCheck = await pool.query(
        'SELECT id FROM cars WHERE plaque_immatriculation = $1 AND id != $2',
        [plaque_immatriculation, id]
      );

      if (plateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cette plaque d\'immatriculation est déjà utilisée'
        });
      }
    }

    // Construire la requête UPDATE dynamiquement
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nom_modele !== undefined) {
      updates.push(`nom_modele = $${paramIndex}`);
      values.push(nom_modele);
      paramIndex++;
    }
    if (plaque_immatriculation !== undefined) {
      updates.push(`plaque_immatriculation = $${paramIndex}`);
      values.push(plaque_immatriculation);
      paramIndex++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);
    const updateQuery = `
      UPDATE cars 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      data: {
        car: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/cars/:id
 * Supprimer un véhicule
 */
const deleteCar = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Vérifier si le véhicule est assigné à un chauffeur
    const assignedDriver = await client.query(
      'SELECT user_id FROM driver_profiles WHERE car_id = $1',
      [id]
    );

    if (assignedDriver.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce véhicule car il est assigné à un chauffeur'
      });
    }

    // Supprimer les maintenances associées
    await client.query('DELETE FROM maintenance WHERE car_id = $1', [id]);

    // Supprimer le véhicule
    const result = await client.query(
      'DELETE FROM cars WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// ============================================
// GESTION DES CLIENTS
// ============================================

/**
 * GET /api/admin/clients
 * Liste des clients avec pagination
 */
const getClients = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '' 
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        cp.nom ILIKE $${paramIndex} OR 
        cp.prenom ILIKE $${paramIndex} OR 
        cp.telephone ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Compter le total
    const countQuery = `
      SELECT COUNT(*) 
      FROM client_profiles cp
      JOIN users u ON u.id = cp.user_id
      ${whereClause}
    `;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count);

    // Récupérer les clients
    queryParams.push(limit, offset);
    const clientsQuery = `
      SELECT 
        cp.user_id,
        cp.nom,
        cp.prenom,
        cp.telephone,
        cp.lieu_residence,
        u.email,
        u.created_at,
        COUNT(r.id) as total_rides,
        COALESCE(SUM(r.prix), 0) as total_spent
      FROM client_profiles cp
      JOIN users u ON u.id = cp.user_id
      LEFT JOIN rides r ON r.client_id = cp.user_id
      ${whereClause}
      GROUP BY cp.user_id, cp.nom, cp.prenom, cp.telephone, 
               cp.lieu_residence, u.email, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const clientsResult = await pool.query(clientsQuery, queryParams);

    res.json({
      success: true,
      data: {
        clients: clientsResult.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/clients/:id
 * Supprimer un client
 */
const deleteClient = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Vérifier s'il a des courses en cours
    const activeRides = await client.query(
      `SELECT id FROM rides 
       WHERE client_id = $1 
       AND status IN ('pending', 'accepted', 'arrived', 'in_progress')`,
      [id]
    );

    if (activeRides.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce client car il a des courses en cours'
      });
    }

    // Supprimer le profil client
    const profileResult = await client.query(
      'DELETE FROM client_profiles WHERE user_id = $1 RETURNING user_id',
      [id]
    );

    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Supprimer l'utilisateur
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// ============================================
// GESTION DE LA MAINTENANCE
// ============================================

/**
 * GET /api/admin/maintenance
 * Liste de l'historique de maintenance
 */
const getMaintenanceHistory = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      car_id,
      type_maintenance 
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (car_id) {
      whereConditions.push(`m.car_id = $${paramIndex}`);
      queryParams.push(car_id);
      paramIndex++;
    }

    if (type_maintenance) {
      whereConditions.push(`m.type_maintenance = $${paramIndex}`);
      queryParams.push(type_maintenance);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Compter le total
    const countQuery = `SELECT COUNT(*) FROM maintenance m ${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count);

    // Récupérer les maintenances
    queryParams.push(limit, offset);
   const maintenanceQuery = `
  SELECT 
    m.*,  -- TOUT maintenance
    COALESCE(c.nom_modele, 'Véhicule inconnu') as nom_modele,
    COALESCE(c.plaque_immatriculation, 'Non assigné') as plaque_immatriculation
  FROM maintenance m
  LEFT JOIN cars c ON c.id = m.car_id  -- LEFT = tolérant si pas de voiture
  ${whereClause}
  ORDER BY m.date_maintenance DESC
  LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
`;

    
    const maintenanceResult = await pool.query(maintenanceQuery, queryParams);

    res.json({
      success: true,
      data: {
        maintenances: maintenanceResult.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/maintenance
 * Ajouter une nouvelle maintenance
 */
const createMaintenance = async (req, res, next) => {
  try {
    const {
      car_id,
      type_maintenance,
      description,
      cout,
      date_maintenance
    } = req.body;

    // Vérifier que le véhicule existe
    const carExists = await pool.query(
      'SELECT id FROM cars WHERE id = $1',
      [car_id]
    );

    if (carExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    const result = await pool.query(
      `INSERT INTO maintenance (
        car_id, type_maintenance, description, cout, date_maintenance
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [car_id, type_maintenance, description, cout, date_maintenance || new Date()]
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance ajoutée avec succès',
      data: {
        maintenance: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/feedbacks
 * Liste des avis clients
 */
const getFeedbacks = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        feedbacks: [],
        pagination: {
          current_page: 1,
          per_page: 10,
          total: 0,
          total_pages: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Statistiques
  getDriverStats,
  getVehicleStats,
  getClientStats,
  getMaintenanceStats,
  getFeedbackStats,
  
  // Chauffeurs
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  
  // Véhicules
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  
  // Clients
  getClients,
  deleteClient,
  
  // Maintenance
  getMaintenanceHistory,
  createMaintenance,
  
  // Feedbacks
  getFeedbacks
};
