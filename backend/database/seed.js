const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('Début du seeding de la base de données...\n');

    // Hash du mot de passe par défaut
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Créer un admin
    console.log('Création de l\'utilisateur admin...');
    await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@taxitrack.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [defaultPassword]);

    // 2. Créer des voitures
    console.log('Création des voitures...');
    const car1 = await client.query(`
      INSERT INTO cars (nom_modele, plaque_immatriculation, status, type_vehicule)
      VALUES ('Toyota Corolla 2020', 'ABC-1234-BF', 'available', 'Sedan')
      ON CONFLICT (plaque_immatriculation) DO NOTHING
      RETURNING id;
    `);

    const car2 = await client.query(`
      INSERT INTO cars (nom_modele, plaque_immatriculation, status, type_vehicule)
      VALUES ('Honda Civic 2021', 'XYZ-5678-BF', 'available', 'Sedan')
      ON CONFLICT (plaque_immatriculation) DO NOTHING
      RETURNING id;
    `);

    // Get car IDs (either from RETURNING or query if they already existed)
    let c1id = car1.rows[0]?.id;
    if (!c1id) {
      const res = await client.query("SELECT id FROM cars WHERE plaque_immatriculation = 'ABC-1234-BF'");
      c1id = res.rows[0].id;
    }
    let c2id = car2.rows[0]?.id;
    if (!c2id) {
      const res = await client.query("SELECT id FROM cars WHERE plaque_immatriculation = 'XYZ-5678-BF'");
      c2id = res.rows[0].id;
    }

    // 3. Créer des chauffeurs
    console.log('Création des chauffeurs...');
    const driver1Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('driver1@taxitrack.com', $1, 'driver')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    let d1id = driver1Result.rows[0]?.id;
    if (!d1id) {
      const res = await client.query("SELECT id FROM users WHERE email = 'driver1@taxitrack.com'");
      d1id = res.rows[0].id;
    }

    await client.query(`
      INSERT INTO driver_profiles (user_id, nom, prenom, telephone, lieu_residence, cnib, date_entree, car_id)
      VALUES ($1, 'Ouedraogo', 'Jean', '+22670123456', 'Ouagadougou, Secteur 15', 'B123456789', '2023-01-15', $2)
      ON CONFLICT (user_id) DO NOTHING;
    `, [d1id, c1id]);

    const driver2Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('driver2@taxitrack.com', $1, 'driver')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    let d2id = driver2Result.rows[0]?.id;
    if (!d2id) {
      const res = await client.query("SELECT id FROM users WHERE email = 'driver2@taxitrack.com'");
      d2id = res.rows[0].id;
    }

    await client.query(`
      INSERT INTO driver_profiles (user_id, nom, prenom, telephone, lieu_residence, cnib, date_entree, car_id)
      VALUES ($1, 'Kaboré', 'Marie', '+22670987654', 'Ouagadougou, Secteur 30', 'B987654321', '2023-03-20', $2)
      ON CONFLICT (user_id) DO NOTHING;
    `, [d2id, c2id]);

    // 4. Créer des clients
    console.log('Création des clients...');
    const client1Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('client1@test.com', $1, 'client')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    let u1id = client1Result.rows[0]?.id;
    if (!u1id) {
      const res = await client.query("SELECT id FROM users WHERE email = 'client1@test.com'");
      u1id = res.rows[0].id;
    }

    await client.query(`
      INSERT INTO client_profiles (user_id, nom, prenom, telephone, lieu_residence)
      VALUES ($1, 'Sawadogo', 'Ibrahim', '+22670111222', 'Ouagadougou, Secteur 12')
      ON CONFLICT (user_id) DO NOTHING;
    `, [u1id]);

    const client2Result = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('client2@test.com', $1, 'client')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [defaultPassword]);

    let u2id = client2Result.rows[0]?.id;
    if (!u2id) {
      const res = await client.query("SELECT id FROM users WHERE email = 'client2@test.com'");
      u2id = res.rows[0].id;
    }

    await client.query(`
      INSERT INTO client_profiles (user_id, nom, prenom, telephone, lieu_residence)
      VALUES ($1, 'Compaoré', 'Fatima', '+22670333444', 'Ouagadougou, Gounghin')
      ON CONFLICT (user_id) DO NOTHING;
    `, [u2id]);

    // 5. Maintenance
    console.log('Création des maintenances...');
    await client.query(`
      INSERT INTO maintenance (car_id, type_maintenance, description, cout, date_maintenance)
      VALUES 
        ($1, 'Vidange', 'Vidange moteur et changement filtre', 25000, '2024-01-15'),
        ($2, 'Réparation Freins', 'Changement plaquettes avant', 45000, '2024-01-20'),
        ($1, 'Pneus', 'Changement 2 pneus avant', 80000, '2024-02-01')
    `, [c1id, c2id]);

    console.log('\nSeeding terminé avec succès !');

  } catch (error) {
    console.error('Erreur lors du seeding:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();