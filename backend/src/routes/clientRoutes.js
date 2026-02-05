const express = require('express');
const { body, param, query } = require('express-validator');
const {
  requestRide,
  getActiveRide,
  getRideHistory,
  rateRide
} = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Toutes les routes Client nécessitent une authentification + rôle "client"
router.use(authenticate);
router.use(authorize('client'));

/**
 * @route   POST /api/client/rides/request
 * @desc    Demander une nouvelle course
 * @access  Client only
 */
router.post(
  '/rides/request',
  [
    body('pickup_address')
      .notEmpty()
      .withMessage('L\'adresse de départ est requise')
      .trim(),
    body('pickup_lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude de départ invalide'),
    body('pickup_long')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude de départ invalide'),
    body('dest_address')
      .notEmpty()
      .withMessage('L\'adresse de destination est requise')
      .trim(),
    body('dest_lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude de destination invalide'),
    body('dest_long')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude de destination invalide'),
    handleValidationErrors
  ],
  requestRide
);

/**
 * @route   GET /api/client/rides/active
 * @desc    Récupérer la course active du client
 * @access  Client only
 */
router.get('/rides/active', getActiveRide);

/**
 * @route   GET /api/client/rides/history
 * @desc    Récupérer l'historique des courses
 * @access  Client only
 */
router.get(
  '/rides/history',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Le numéro de page doit être un entier positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100'),
    handleValidationErrors
  ],
  getRideHistory
);

/**
 * @route   POST /api/client/rides/:id/rating
 * @desc    Noter une course terminée
 * @access  Client only
 */
router.post(
  '/rides/:id/rating',
  [
    param('id')
      .isInt()
      .withMessage('ID de course invalide'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('La note doit être entre 1 et 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
    handleValidationErrors
  ],
  rateRide
);

module.exports = router;