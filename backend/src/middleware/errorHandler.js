const { validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Middleware global de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur de duplication PostgreSQL (UNIQUE violation)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Cette valeur existe déjà dans la base de données',
      error: err.detail
    });
  }

  // Erreur de clé étrangère PostgreSQL
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide à une ressource inexistante',
      error: err.detail
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { handleValidationErrors, errorHandler };