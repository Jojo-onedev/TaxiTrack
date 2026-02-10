const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Tous les endpoints admin nécessitent authentification + autorisation admin
router.use(authenticate);
router.use(authorize('admin'));

// ============================================
// STATISTIQUES - Dashboard
// ============================================

/**
 * GET /api/admin/stats/drivers
 * Statistiques globales des chauffeurs
 */
router.get('/stats/drivers', adminController.getDriverStats);

/**
 * GET /api/admin/stats/vehicles
 * Statistiques des véhicules
 */
router.get('/stats/vehicles', adminController.getVehicleStats);

/**
 * GET /api/admin/stats/clients
 * Statistiques des clients
 */
router.get('/stats/clients', adminController.getClientStats);

/**
 * GET /api/admin/stats/maintenance
 * Statistiques de maintenance
 */
router.get('/stats/maintenance', adminController.getMaintenanceStats);

/**
 * GET /api/admin/stats/feedbacks
 * Statistiques des avis clients
 */
router.get('/stats/feedbacks', adminController.getFeedbackStats);

// ============================================
// GESTION DES CHAUFFEURS
// ============================================

/**
 * GET /api/admin/drivers
 * Liste des chauffeurs avec filtres et pagination
 * Query params: page, limit, search, availability, has_car
 */
router.get('/drivers', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('availability').optional().isBoolean().withMessage('Availability doit être un booléen'),
  query('has_car').optional().isBoolean().withMessage('Has_car doit être un booléen')
], adminController.getDrivers);

/**
 * GET /api/admin/drivers/:id
 * Détails d'un chauffeur
 */
router.get('/drivers/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.getDriverById);

/**
 * POST /api/admin/drivers
 * Créer un nouveau chauffeur
 */
router.post('/drivers', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('nom').notEmpty().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('prenom').notEmpty().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('lieu_residence').optional(),
  body('car_id').optional().isInt().withMessage('Car ID doit être un entier')
], adminController.createDriver);

/**
 * PATCH /api/admin/drivers/:id
 * Modifier un chauffeur
 */
router.patch('/drivers/:id', [
  param('id').isInt().withMessage('ID doit être un entier'),
  body('nom').optional().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('prenom').optional().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('telephone').optional(),
  body('lieu_residence').optional(),
  body('car_id').optional().isInt().withMessage('Car ID doit être un entier'),
  body('availability').optional().isBoolean().withMessage('Availability doit être un booléen')
], adminController.updateDriver);

/**
 * DELETE /api/admin/drivers/:id
 * Supprimer un chauffeur
 */
router.delete('/drivers/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteDriver);

// ============================================
// GESTION DES VÉHICULES
// ============================================

/**
 * GET /api/admin/cars
 * Liste des véhicules avec filtres et pagination
 * Query params: page, limit, search, status, type_vehicule
 */
router.get('/cars', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('status').optional().isIn(['active', 'maintenance', 'inactive']).withMessage('Status invalide'),
  query('type_vehicule').optional()
], adminController.getCars);

/**
 * GET /api/admin/cars/:id
 * Détails d'un véhicule
 */
router.get('/cars/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.getCarById);

/**
 * POST /api/admin/cars
 * Ajouter un nouveau véhicule
 */
router.post('/cars', [
  body('nom_modele').notEmpty().withMessage('Le nom du modèle est requis'),
  body('plaque_immatriculation').notEmpty().withMessage('La plaque d\'immatriculation est requise'),
  body('type_vehicule').notEmpty().withMessage('Le type de véhicule est requis'),
  body('couleur').optional(),
  body('annee_fabrication').optional().isInt({ min: 1900, max: 2030 }).withMessage('Année de fabrication invalide'),
  body('kilometrage').optional().isInt({ min: 0 }).withMessage('Le kilométrage doit être positif'),
  body('status').optional().isIn(['active', 'maintenance', 'inactive']).withMessage('Status invalide')
], adminController.createCar);

/**
 * PATCH /api/admin/cars/:id
 * Modifier un véhicule
 */
router.patch('/cars/:id', [
  param('id').isInt().withMessage('ID doit être un entier'),
  body('nom_modele').optional(),
  body('plaque_immatriculation').optional(),
  body('type_vehicule').optional(),
  body('couleur').optional(),
  body('annee_fabrication').optional().isInt({ min: 1900, max: 2030 }).withMessage('Année de fabrication invalide'),
  body('kilometrage').optional().isInt({ min: 0 }).withMessage('Le kilométrage doit être positif'),
  body('status').optional().isIn(['active', 'maintenance', 'inactive']).withMessage('Status invalide')
], adminController.updateCar);

/**
 * DELETE /api/admin/cars/:id
 * Supprimer un véhicule
 */
router.delete('/cars/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteCar);

// ============================================
// GESTION DES CLIENTS
// ============================================

/**
 * GET /api/admin/clients
 * Liste des clients avec pagination
 * Query params: page, limit, search
 */
router.get('/clients', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100')
], adminController.getClients);

/**
 * DELETE /api/admin/clients/:id
 * Supprimer un client
 */
router.delete('/clients/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteClient);

// ============================================
// GESTION DE LA MAINTENANCE
// ============================================

/**
 * GET /api/admin/maintenance
 * Liste de l'historique de maintenance
 * Query params: page, limit, car_id, type_maintenance
 */
router.get('/maintenance', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('car_id').optional().isInt().withMessage('Car ID doit être un entier'),
  query('type_maintenance').optional()
], adminController.getMaintenanceHistory);

/**
 * POST /api/admin/maintenance
 * Ajouter une nouvelle maintenance
 */
router.post('/maintenance', [
  body('car_id').isInt().withMessage('Car ID doit être un entier'),
  body('type_maintenance').notEmpty().withMessage('Le type de maintenance est requis'),
  body('description').optional(),
  body('cout').isFloat({ min: 0 }).withMessage('Le coût doit être un nombre positif'),
  body('date_maintenance').optional().isISO8601().withMessage('Date invalide')
], adminController.createMaintenance);

/**
 * PUT /api/admin/maintenance/:id
 * Modifier une maintenance
 */
router.put('/maintenance/:id', [
  param('id').isInt().withMessage('ID doit être un entier'),
  body('car_id').optional().isInt().withMessage('Car ID doit être un entier'),
  body('type_maintenance').optional().notEmpty().withMessage('Le type de maintenance est requis'),
  body('description').optional(),
  body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût doit être un nombre positif'),
  body('date_maintenance').optional().isISO8601().withMessage('Date invalide')
], adminController.updateMaintenance);


/** * DELETE /api/admin/maintenance/:id
 * Supprimer une maintenance
 */
router.delete('/maintenance/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteMaintenance);



/**
 * DELETE /api/admin/maintenance/:id
 * Supprimer une maintenance
 */
router.delete('/maintenance/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteMaintenance);

// ============================================
// GESTION DES FEEDBACKS
// ============================================

/**
 * GET /api/admin/feedbacks
 * Liste des avis clients
 * Query params: page, limit
 */
router.get('/feedbacks', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100')
], adminController.getFeedbacks);

// // adminController.js


// exports.updateMaintenance = async (req, res, next) => {
//   const { id } = req.params;
//   const { car_id, type_maintenance, description, cout, date_maintenance } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE maintenance 
//        SET car_id=$1, type_maintenance=$2, description=$3, cout=$4, date_maintenance=$5 
//        WHERE id=$6 RETURNING *`,
//       [car_id, type_maintenance, description, cout, date_maintenance, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Maintenance non trouvée' });
//     }

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteMaintenance = async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(`DELETE FROM maintenance WHERE id=$1 RETURNING *`, [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Maintenance non trouvée' });
//     }
//     res.json({ success: true, message: 'Maintenance supprimée' });
//   } catch (err) {
//     next(err);
//   }
// };



module.exports = router;