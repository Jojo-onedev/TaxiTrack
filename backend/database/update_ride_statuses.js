const pool = require('../src/config/database');

const updateRideStatuses = async () => {
  const client = await pool.connect();

  try {
    console.log('Mise à jour des statuts de courses autorisés...\n');

    // Supprimer l'ancienne contrainte
    await client.query(`
      ALTER TABLE rides 
      DROP CONSTRAINT IF EXISTS rides_status_check;
    `);

    // Ajouter la nouvelle contrainte avec tous les statuts
    await client.query(`
      ALTER TABLE rides 
      ADD CONSTRAINT rides_status_check 
      CHECK (status IN ('pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'));
    `);

    console.log('Statuts mis à jour avec succès !');
    console.log('   Statuts autorisés :');
    console.log('   - pending (demande créée)');
    console.log('   - accepted (chauffeur trouvé)');
    console.log('   - arrived (chauffeur au départ)');
    console.log('   - in_progress (trajet en cours)');
    console.log('   - completed (terminé)');
    console.log('   - cancelled (annulé)');

  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

updateRideStatuses();