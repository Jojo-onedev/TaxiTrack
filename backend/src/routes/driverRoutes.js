const express = require('express');
const { body, param, query } = require('express-validator');
const {
  updateOnlineStatus,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverStats,
  getDriverCar
} = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Toutes les routes Driver nécessitent une authentification + rôle "driver"
router.use(authenticate);
router.use(authorize('driver'));

/**
 * @route   PATCH /api/driver/status
 * @desc    Mettre à jour le statut en ligne/hors ligne
 * @access  Driver only
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
 * @route   GET /api/driver/rides/available
 * @desc    Récupérer les courses disponibles
 * @access  Driver only
 */
router.get('/rides/available', getAvailableRides);

/**
 * @route   POST /api/driver/rides/:id/accept
 * @desc    Accepter une course
 * @access  Driver only
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
 * @route   PATCH /api/driver/rides/:id/update-status
 * @desc    Mettre à jour le statut d'une course
 * @access  Driver only
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
 * @route   GET /api/driver/stats/summary
 * @desc    Récupérer les statistiques du chauffeur
 * @access  Driver only
 */
router.get('/stats/summary', getDriverStats);

/**
 * @route   GET /api/driver/car
 * @desc    Récupérer les infos du véhicule
 * @access  Driver only
 */
router.get('/car', getDriverCar);

module.exports = router;