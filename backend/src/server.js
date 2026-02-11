const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { initializeSocket } = require('./config/socket');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const driverRoutes = require('./routes/driverRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.io
const io = initializeSocket(server);

// Rendre io accessible dans toute l'application
app.set('io', io);

// Middlewares de sécurité et configuration
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour passer io aux routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API TaxiTrack',
    version: '1.0.0',
    features: {
      rest_api: true,
      websocket: true,
      realtime_notifications: true
    },
    endpoints: {
      auth: '/api/auth',
      client: '/api/client',
      driver: '/api/driver',
      admin: '/api/admin (à venir)'
    }
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    websocket: 'active'
  });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/driver', driverRoutes);
// Elodie a ajoute les routes admin
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

const maintenanceRoutes = require('./routes/maintenance');
app.use('/api/admin/maintenance', maintenanceRoutes); // <- ici !

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur (avec Socket.io)
server.listen(PORT, () => {
  console.log('================================');
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket: Actif`);
  console.log('================================');
});

module.exports = app;