const express = require('express');
const { body, param, query } = require('express-validator');
const {
  updateOnlineStatus,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverStats,
  getDriverCar,
  getDriverRideHistory,
  getDriverEarningsHistory
} = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Toutes les routes Driver nécessitent une authentification + rôle "driver"
router.use(authenticate);
router.use(authorize('driver'));

/**
 * @swagger
 * /driver/status:
 *   patch:
 *     summary: Mettre à jour le statut en ligne/hors ligne
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_online]
 *             properties:
 *               is_online: { type: boolean }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch(
  '/status',
  [
    body('is_online')
      .isBoolean()
      .withMessage('is_online doit être un booléen (true/false)'),
    handleValidationErrors
  ],
  updateOnlineStatus
);

/**
 * @swagger
 * /driver/rides/available:
 *   get:
 *     summary: Récupérer les courses disponibles
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des courses en attente
 */
router.get('/rides/available', getAvailableRides);

/**
 * @swagger
 * /driver/rides/{id}/accept:
 *   post:
 *     summary: Accepter une course
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Course acceptée
 */
router.post(
  '/rides/:id/accept',
  [
    param('id')
      .isInt()
      .withMessage('ID de course invalide'),
    handleValidationErrors
  ],
  acceptRide
);

/**
 * @swagger
 * /driver/rides/{id}/update-status:
 *   patch:
 *     summary: Mettre à jour le statut d'une course
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [arrived, in_progress, completed] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch(
  '/rides/:id/update-status',
  [
    param('id')
      .isInt()
      .withMessage('ID de course invalide'),
    body('status')
      .isIn(['arrived', 'in_progress', 'completed'])
      .withMessage('Statut invalide. Valeurs acceptées: arrived, in_progress, completed'),
    handleValidationErrors
  ],
  updateRideStatus
);

/**
 * @swagger
 * /driver/stats/summary:
 *   get:
 *     summary: Récupérer les statistiques du chauffeur
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Résumé des gains et trajets
 */
router.get('/stats/summary', getDriverStats);

/**
 * @swagger
 * /driver/car:
 *   get:
 *     summary: Récupérer les infos du véhicule
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails du véhicule assigné
 */
router.get('/car', getDriverCar);

/**
 * @swagger
 * /driver/rides/history:
 *   get:
 *     summary: Récupérer l'historique des courses
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trajets effectués
 */
router.get('/rides/history', getDriverRideHistory);

/**
 * @swagger
 * /driver/earnings/history:
 *   get:
 *     summary: Récupérer l'historique des gains
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste chronologique des gains
 */
router.get('/earnings/history', getDriverEarningsHistory);

module.exports = router;
