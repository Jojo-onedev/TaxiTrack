const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Inscription d'un nouveau client
 */
const registerClient = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { email, password, nom, prenom, telephone, lieu_residence } = req.body;

    await client.query('BEGIN');

    // Vérifier si l'email existe déjà
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'client')
       RETURNING id, email, role, created_at`,
      [email, passwordHash]
    );

    const user = userResult.rows[0];

    // Créer le profil client
    await client.query(
      `INSERT INTO client_profiles (user_id, nom, prenom, telephone, lieu_residence)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, nom, prenom, telephone, lieu_residence]
    );

    await client.query('COMMIT');

    // Générer le token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          nom,
          prenom
        },
        token
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
 * Connexion d'un utilisateur (client, driver ou admin)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Récupérer le profil selon le rôle
    let profile = null;
    
    if (user.role === 'client') {
      const clientProfile = await pool.query(
        'SELECT nom, prenom, telephone, lieu_residence FROM client_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = clientProfile.rows[0];
    } else if (user.role === 'driver') {
      const driverProfile = await pool.query(
        `SELECT dp.nom, dp.prenom, dp.telephone, dp.lieu_residence, dp.cnib, 
                c.nom_modele, c.plaque_immatriculation
         FROM driver_profiles dp
         LEFT JOIN cars c ON dp.car_id = c.id
         WHERE dp.user_id = $1`,
        [user.id]
      );
      profile = driverProfile.rows[0];
    }

    // Générer le token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          ...profile
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params = [userId];

    if (userRole === 'client') {
      query = `
        SELECT u.id, u.email, u.role, 
               cp.nom, cp.prenom, cp.telephone, cp.lieu_residence
        FROM users u
        JOIN client_profiles cp ON u.id = cp.user_id
        WHERE u.id = $1
      `;
    } else if (userRole === 'driver') {
      query = `
        SELECT u.id, u.email, u.role, 
               dp.nom, dp.prenom, dp.telephone, dp.lieu_residence, dp.cnib,
               c.nom_modele, c.plaque_immatriculation
        FROM users u
        JOIN driver_profiles dp ON u.id = dp.user_id
        LEFT JOIN cars c ON dp.car_id = c.id
        WHERE u.id = $1
      `;
    } else {
      query = 'SELECT id, email, role FROM users WHERE id = $1';
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 * Mettre à jour les informations de profil
 */
const updateProfile = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { nom, prenom, telephone, lieu_residence } = req.body;

    await client.query('BEGIN');

    // Mettre à jour selon le rôle
    if (userRole === 'client') {
      await client.query(
        `UPDATE client_profiles 
         SET nom = $1, prenom = $2, telephone = $3, lieu_residence = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [nom, prenom, telephone, lieu_residence, userId]
      );
    } else if (userRole === 'driver') {
      await client.query(
        `UPDATE driver_profiles 
         SET nom = $1, prenom = $2, telephone = $3, lieu_residence = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [nom, prenom, telephone, lieu_residence, userId]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        nom,
        prenom,
        telephone,
        lieu_residence
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  registerClient,
  login,
  getMe,
  updateProfile
};