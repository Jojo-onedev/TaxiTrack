const { Server } = require('socket.io');

let io;

/**
 * Initialiser Socket.io avec le serveur HTTP
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
  cors: {
    origin: '*',  // Temporaire pour le debug
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['*']
  },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware d'authentification pour Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token manquant'));
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log(`Utilisateur connecté: ${socket.userEmail} (${socket.userRole})`);

    // Rejoindre la room personnelle de l'utilisateur
    socket.join(`user_${socket.userId}`);
    
    // Si c'est un chauffeur, rejoindre aussi la room des chauffeurs
    if (socket.userRole === 'driver') {
      socket.join('drivers');
      console.log(`Chauffeur ${socket.userId} a rejoint la room 'drivers'`);
    }

    // Si c'est un client, rejoindre la room des clients
    if (socket.userRole === 'client') {
      socket.join('clients');
      console.log(`Client ${socket.userId} a rejoint la room 'clients'`);
    }

    // Événement: Le chauffeur envoie sa position GPS
    socket.on('update_location', async (data) => {
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Seuls les chauffeurs peuvent envoyer leur position' });
      }

      const { lat, long } = data;

      // Mettre à jour la position dans la base de données
      try {
        const pool = require('./database');
        await pool.query(
          `UPDATE driver_profiles 
           SET current_lat = $1, current_long = $2, last_location_update = CURRENT_TIMESTAMP
           WHERE user_id = $3`,
          [lat, long, socket.userId]
        );

        // Récupérer la course active du chauffeur
        const activeRide = await pool.query(
          `SELECT client_id FROM rides 
           WHERE driver_id = $1 
           AND status IN ('accepted', 'arrived', 'in_progress')
           LIMIT 1`,
          [socket.userId]
        );

        // Envoyer la position au client concerné
        if (activeRide.rows.length > 0) {
          const clientId = activeRide.rows[0].client_id;
          io.to(`user_${clientId}`).emit('driver_position', {
            lat,
            long,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Erreur mise à jour position:', error);
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`Utilisateur déconnecté: ${socket.userEmail}`);
    });
  });

  console.log('🔌 Socket.io initialisé avec succès');
  return io;
};

/**
 * Obtenir l'instance Socket.io
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io n\'est pas initialisé. Appelez initializeSocket() d\'abord.');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};