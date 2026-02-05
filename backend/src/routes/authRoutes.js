const express = require('express');
const { body } = require('express-validator');
const { registerClient, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouveau client
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('nom')
      .notEmpty()
      .withMessage('Le nom est requis')
      .trim(),
    body('prenom')
      .notEmpty()
      .withMessage('Le prénom est requis')
      .trim(),
    body('telephone')
      .notEmpty()
      .withMessage('Le téléphone est requis')
      .trim(),
    body('lieu_residence')
      .optional()
      .trim(),
    handleValidationErrors
  ],
  registerClient
);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Le mot de passe est requis'),
    handleValidationErrors
  ],
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, getMe);

module.exports = router;