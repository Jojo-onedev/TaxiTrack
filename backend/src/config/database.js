const { Pool } = require('pg');
require('dotenv').config();

// Création du pool de connexions PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taxitrack_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Nombre maximum de connexions simultanées
  idleTimeoutMillis: 30000, // Temps avant de fermer une connexion inactive
  connectionTimeoutMillis: 2000, // Timeout de connexion
});

// Événement : connexion établie
pool.on('connect', () => {
  console.log(' Connexion à PostgreSQL établie');
});

// Événement : erreur
pool.on('error', (err) => {
  console.error('Erreur PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;