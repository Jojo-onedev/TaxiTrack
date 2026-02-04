const pool = require('../src/config/database');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('Début du seeding de la base de données...\n');

    // Hash du mot de passe par défaut
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Créer un admin
    console.log('Création de l\'utilisateur admin...');
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@taxitrack.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    // 2. Créer des voitures
    console.log('Création des voitures...');
    const car1 = await client.query(`
      INSERT INTO cars (nom_modele, plaque_immatriculation, status)
      VALUES ('Toyota Corolla 2020', 'ABC-1234-BF', 'available')
      ON CONFLICT (plaque_immatriculation) DO NOTHING
      RETURNING id;
    `);

    const car2 = await client.query(`
      INSERT INTO cars (nom_modele, plaque_immatriculation, status)
      VALUES ('Honda Civic 2021', 'XYZ-5678-BF', 'available')
      ON CONFLICT (plaque_immatriculation) DO NOTHING
      RETURNING id;
    `);

    // 3. Créer des chauffeurs
    console.log('Création des chauffeurs...');
    const driver1Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('driver1@taxitrack.com', $1, 'driver')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    if (driver1Result.rows.length > 0 && car1.rows.length > 0) {
      await client.query(`
        INSERT INTO driver_profiles (user_id, nom, prenom, telephone, lieu_residence, cnib, date_entree, car_id)
        VALUES ($1, 'Ouedraogo', 'Jean', '+22670123456', 'Ouagadougou, Secteur 15', 'B123456789', '2023-01-15', $2)
        ON CONFLICT (user_id) DO NOTHING;
      `, [driver1Result.rows[0].id, car1.rows[0].id]);
    }

    const driver2Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('driver2@taxitrack.com', $1, 'driver')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    if (driver2Result.rows.length > 0 && car2.rows.length > 0) {
      await client.query(`
        INSERT INTO driver_profiles (user_id, nom, prenom, telephone, lieu_residence, cnib, date_entree, car_id)
        VALUES ($1, 'Kaboré', 'Marie', '+22670987654', 'Ouagadougou, Secteur 30', 'B987654321', '2023-03-20', $2)
        ON CONFLICT (user_id) DO NOTHING;
      `, [driver2Result.rows[0].id, car2.rows[0].id]);
    }

    // 4. Créer des clients
    console.log('Création des clients...');
    const client1Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('client1@test.com', $1, 'client')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    if (client1Result.rows.length > 0) {
      await client.query(`
        INSERT INTO client_profiles (user_id, nom, prenom, telephone, lieu_residence)
        VALUES ($1, 'Sawadogo', 'Ibrahim', '+22670111222', 'Ouagadougou, Secteur 12')
        ON CONFLICT (user_id) DO NOTHING;
      `, [client1Result.rows[0].id]);
    }

    const client2Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('client2@test.com', $1, 'client')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    if (client2Result.rows.length > 0) {
      await client.query(`
        INSERT INTO client_profiles (user_id, nom, prenom, telephone, lieu_residence)
        VALUES ($1, 'Compaoré', 'Fatima', '+22670333444', 'Ouagadougou, Gounghin')
        ON CONFLICT (user_id) DO NOTHING;
      `, [client2Result.rows[0].id]);
    }

    console.log('\nSeeding terminé avec succès !');
    console.log('onnées de test créées :');
    console.log('   - 1 admin (admin@taxitrack.com / password123)');
    console.log('   - 2 chauffeurs (driver1@taxitrack.com, driver2@taxitrack.com / password123)');
    console.log('   - 2 clients (client1@test.com, client2@test.com / password123)');
    console.log('   - 2 voitures');
    console.log('\nVous pouvez maintenant démarrer le serveur : npm run dev');

  } catch (error) {
    console.error('Erreur lors du seeding:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();