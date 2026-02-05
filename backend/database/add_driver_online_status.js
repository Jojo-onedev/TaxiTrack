const pool = require('../src/config/database');

const addDriverOnlineStatus = async () => {
  const client = await pool.connect();

  try {
    console.log('Ajout du champ is_online pour les chauffeurs...\n');

    // Ajouter la colonne is_online à la table driver_profiles
    await client.query(`
      ALTER TABLE driver_profiles 
      ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
    `);

    // Ajouter une colonne pour stocker la dernière position du chauffeur
    await client.query(`
      ALTER TABLE driver_profiles 
      ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS current_long DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP;
    `);

    console.log('Champs ajoutés avec succès !');
    console.log('   - is_online (statut en ligne/hors ligne)');
    console.log('   - current_lat/current_long (position actuelle)');
    console.log('   - last_location_update (dernière mise à jour GPS)');

  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addDriverOnlineStatus();