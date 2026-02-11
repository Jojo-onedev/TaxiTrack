const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Tous les endpoints admin nécessitent authentification + autorisation admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion de la flotte, des chauffeurs et statistiques
 */

/**
 * @swagger
 * /admin/stats/drivers:
 *   get:
 *     summary: Statistiques globales des chauffeurs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats récupérées
 */
router.get('/stats/drivers', adminController.getDriverStats);

/**
 * @swagger
 * /admin/stats/vehicles:
 *   get:
 *     summary: Statistiques des véhicules
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats récupérées
 */
router.get('/stats/vehicles', adminController.getVehicleStats);

/**
 * @swagger
 * /admin/stats/clients:
 *   get:
 *     summary: Statistiques des clients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats récupérées
 */
router.get('/stats/clients', adminController.getClientStats);

/**
 * @swagger
 * /admin/stats/maintenance:
 *   get:
 *     summary: Statistiques de maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats récupérées
 */
router.get('/stats/maintenance', adminController.getMaintenanceStats);

/**
 * @swagger
 * /admin/stats/feedbacks:
 *   get:
 *     summary: Statistiques des avis clients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats récupérées
 */
router.get('/stats/feedbacks', adminController.getFeedbackStats);

/**
 * @swagger
 * /admin/drivers:
 *   get:
 *     summary: Liste des chauffeurs avec filtres
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: availability
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Liste des chauffeurs
 */
router.get('/drivers', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('availability').optional().isBoolean().withMessage('Availability doit être un booléen'),
  query('has_car').optional().isBoolean().withMessage('Has_car doit être un booléen')
], adminController.getDrivers);

/**
 * @swagger
 * /admin/drivers/{id}:
 *   get:
 *     summary: Détails d'un chauffeur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Profil complet du chauffeur
 */
router.get('/drivers/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.getDriverById);

/**
 * @swagger
 * /admin/drivers:
 *   post:
 *     summary: Créer un nouveau chauffeur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, nom, prenom, telephone]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               nom: { type: string }
 *               prenom: { type: string }
 *               telephone: { type: string }
 *     responses:
 *       201:
 *         description: Chauffeur créé
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
 * @swagger
 * /admin/drivers/{id}:
 *   patch:
 *     summary: Modifier un chauffeur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mis à jour avec succès
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
 * @swagger
 * /admin/drivers/{id}:
 *   delete:
 *     summary: Supprimer un chauffeur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/drivers/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteDriver);

/**
 * @swagger
 * /admin/cars:
 *   get:
 *     summary: Liste des véhicules
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des véhicules
 */
router.get('/cars', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('status').optional().isIn(['active', 'maintenance', 'inactive']).withMessage('Status invalide'),
  query('type_vehicule').optional()
], adminController.getCars);

/**
 * @swagger
 * /admin/cars/{id}:
 *   get:
 *     summary: Détails d'un véhicule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails du véhicule
 */
router.get('/cars/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.getCarById);

/**
 * @swagger
 * /admin/cars:
 *   post:
 *     summary: Ajouter un nouveau véhicule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom_modele, plaque_immatriculation, type_vehicule]
 *             properties:
 *               nom_modele: { type: string }
 *               plaque_immatriculation: { type: string }
 *               type_vehicule: { type: string }
 *               status: { type: string, enum: [active, maintenance, inactive] }
 *     responses:
 *       201:
 *         description: Véhicule ajouté
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
 * @swagger
 * /admin/cars/{id}:
 *   patch:
 *     summary: Modifier un véhicule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mis à jour avec succès
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
 * @swagger
 * /admin/cars/{id}:
 *   delete:
 *     summary: Supprimer un véhicule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/cars/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteCar);

/**
 * @swagger
 * /admin/clients:
 *   get:
 *     summary: Liste des clients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 */
router.get('/clients', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100')
], adminController.getClients);

/**
 * @swagger
 * /admin/clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/clients/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteClient);

/**
 * @swagger
 * /admin/maintenance:
 *   get:
 *     summary: Liste de l'historique de maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
 */
router.get('/maintenance', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('car_id').optional().isInt().withMessage('Car ID doit être un entier'),
  query('type_maintenance').optional()
], adminController.getMaintenanceHistory);

/**
 * @swagger
 * /admin/maintenance:
 *   post:
 *     summary: Ajouter une nouvelle maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [car_id, type_maintenance, cout]
 *             properties:
 *               car_id: { type: integer }
 *               type_maintenance: { type: string }
 *               cout: { type: number }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Maintenance enregistrée
 */
router.post('/maintenance', [
  body('car_id').isInt().withMessage('Car ID doit être un entier'),
  body('type_maintenance').notEmpty().withMessage('Le type de maintenance est requis'),
  body('description').optional(),
  body('cout').isFloat({ min: 0 }).withMessage('Le coût doit être un nombre positif'),
  body('date_maintenance').optional().isISO8601().withMessage('Date invalide')
], adminController.createMaintenance);

/**
 * @swagger
 * /admin/maintenance/{id}:
 *   put:
 *     summary: Modifier une maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mis à jour avec succès
 */
router.put('/maintenance/:id', [
  param('id').isInt().withMessage('ID doit être un entier'),
  body('car_id').optional().isInt().withMessage('Car ID doit être un entier'),
  body('type_maintenance').optional().notEmpty().withMessage('Le type de maintenance est requis'),
  body('description').optional(),
  body('cout').optional().isFloat({ min: 0 }).withMessage('Le coût doit être un nombre positif'),
  body('date_maintenance').optional().isISO8601().withMessage('Date invalide')
], adminController.updateMaintenance);

/**
 * @swagger
 * /admin/maintenance/{id}:
 *   delete:
 *     summary: Supprimer une maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/maintenance/:id', [
  param('id').isInt().withMessage('ID doit être un entier')
], adminController.deleteMaintenance);

/**
 * @swagger
 * /admin/feedbacks:
 *   get:
 *     summary: Liste des avis clients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avis récupérés
 */
router.get('/feedbacks', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100')
], adminController.getFeedbacks);

module.exports = router;
