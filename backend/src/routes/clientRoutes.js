const express = require('express');
const { body, param, query } = require('express-validator');
const {
  requestRide,
  getActiveRide,
  getRideById,
  getRideHistory,
  rateRide,
  cancelRide
} = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Toutes les routes Client nécessitent une authentification + rôle "client"
router.use(authenticate);
router.use(authorize('client'));

/**
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *         pickup:
 *           type: object
 *           properties:
 *             address: { type: string }
 *             lat: { type: number }
 *             long: { type: number }
 *         destination:
 *           type: object
 *           properties:
 *             address: { type: string }
 *             lat: { type: number }
 *             long: { type: number }
 *         price:
 *           type: number
 *         driver:
 *           type: object
 *           nullable: true
 *           properties:
 *             name: { type: string }
 */

/**
 * @swagger
 * /client/rides/request:
 *   post:
 *     summary: Demander une nouvelle course
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickup_address, pickup_lat, pickup_long, dest_address, dest_lat, dest_long]
 *             properties:
 *               pickup_address: { type: string }
 *               pickup_lat: { type: number }
 *               pickup_long: { type: number }
 *               dest_address: { type: string }
 *               dest_lat: { type: number }
 *               dest_long: { type: number }
 *     responses:
 *       201:
 *         description: Course créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
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
 * @swagger
 * /client/rides/active:
 *   get:
 *     summary: Récupérer la course active du client
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course active trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 *       404:
 *         description: Aucune course active
 */
router.get('/rides/active', getActiveRide);

/**
 * @swagger
 * /client/rides/history:
 *   get:
 *     summary: Récupérer l'historique des courses
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des courses passées
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
 * @swagger
 * /client/rides/{id}/rating:
 *   post:
 *     summary: Noter une course terminée
 *     tags: [Client]
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
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Note enregistrée
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

/**
 * @swagger
 * /client/rides/{id}:
 *   get:
 *     summary: Récupérer les détails d'une course spécifique
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails de la course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 */
router.get(
  '/rides/:id',
  [
    param('id')
      .isInt()
      .withMessage('ID de course invalide'),
    handleValidationErrors
  ],
  getRideById
);

/**
 * @swagger
 * /client/rides/{id}/cancel:
 *   post:
 *     summary: Annuler une course
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Course annulée
 */
router.post(
  '/rides/:id/cancel',
  [
    param('id')
      .isInt()
      .withMessage('ID de course invalide'),
    handleValidationErrors
  ],
  cancelRide
);

module.exports = router;
