const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de sécurité et configuration
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('dev')); // Logs des requêtes
app.use(express.json()); // Parse le JSON
app.use(express.urlencoded({ extended: true }));

// Route de base (pour tester que le serveur fonctionne)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API TaxiTrack',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      drivers: '/api/drivers (à venir)',
      clients: '/api/clients (à venir)',
      cars: '/api/cars (à venir)',
      rides: '/api/rides (à venir)',
      maintenance: '/api/maintenance (à venir)',
      stats: '/api/stats (à venir)'
    }
  });
});

// Route de santé (health check)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/// Import des routes
const clientRoutes = require('./routes/clientRoutes');
const driverRoutes = require('./routes/driverRoutes');

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/driver', driverRoutes);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('================================');
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================');
});

module.exports = app;