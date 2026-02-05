const pool = require('../src/config/database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Début de la migration des tables...\n');

    // Table Users (utilisateurs : admin, client, driver)
    console.log('Création de la table users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client', 'driver')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table Cars (véhicules)
    console.log('  Création de la table cars...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        nom_modele VARCHAR(100) NOT NULL,
        plaque_immatriculation VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'available' 
          CHECK (status IN ('available', 'in_use', 'maintenance')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table Driver Profiles (profils chauffeurs)
    console.log('  Création de la table driver_profiles...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS driver_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        lieu_residence VARCHAR(255),
        cnib VARCHAR(50) UNIQUE NOT NULL,
        date_entree DATE NOT NULL,
        car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table Client Profiles (profils clients)
    console.log('  Création de la table client_profiles...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        lieu_residence VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table Rides (courses)
    console.log('  Création de la table rides...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES users(id),
        driver_id INTEGER REFERENCES users(id),
        depart_lat DECIMAL(10, 8) NOT NULL,
        depart_long DECIMAL(11, 8) NOT NULL,
        depart_address TEXT,
        dest_lat DECIMAL(10, 8) NOT NULL,
        dest_long DECIMAL(11, 8) NOT NULL,
        dest_address TEXT,
        status VARCHAR(20) DEFAULT 'pending' 
          CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
        prix DECIMAL(10, 2),
        feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
        feedback_comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    // Table Maintenance (entretien véhicules)
    console.log('  Création de la table maintenance...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        type_panne VARCHAR(100),
        cout DECIMAL(10, 2) NOT NULL,
        date_maintenance DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Création des index pour optimiser les performances
    console.log('  Création des index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_rides_client ON rides(client_id);
      CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
      CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
      CREATE INDEX IF NOT EXISTS idx_driver_profiles_car ON driver_profiles(car_id);
    `);

    console.log('\n   Migration terminée avec succès !');
    console.log(' Tables créées :');
    console.log('   - users');
    console.log('   - cars');
    console.log('   - driver_profiles');
    console.log('   - client_profiles');
    console.log('   - rides');
    console.log('   - maintenance');
    console.log('\n Prochaine étape : npm run db:seed (optionnel - données de test)');

  } catch (error) {
    console.error(' Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();