const pool = require('../src/config/database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Début de la migration des tables...\n');

    // 1. Suppression des tables si elles existent (pour repartir à neuf)
    console.log('Nettoyage de la base de données...');
    await client.query('DROP TABLE IF EXISTS maintenance CASCADE');
    await client.query('DROP TABLE IF EXISTS rides CASCADE');
    await client.query('DROP TABLE IF EXISTS client_profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS driver_profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS cars CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    // 2. Table Users (utilisateurs : admin, client, driver)
    console.log('Création de la table users...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client', 'driver')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Table Cars (véhicules)
    console.log('Création de la table cars...');
    await client.query(`
      CREATE TABLE cars (
        id SERIAL PRIMARY KEY,
        nom_modele VARCHAR(100) NOT NULL,
        plaque_immatriculation VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'available' 
          CHECK (status IN ('available', 'in_use', 'maintenance')),
        kilometrage INTEGER DEFAULT 0,
        type_vehicule VARCHAR(50) DEFAULT 'Sedan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Table Driver Profiles (profils chauffeurs)
    console.log('Création de la table driver_profiles...');
    await client.query(`
      CREATE TABLE driver_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        lieu_residence VARCHAR(255),
        cnib VARCHAR(50) UNIQUE NOT NULL,
        date_entree DATE NOT NULL,
        car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
        is_online BOOLEAN DEFAULT false,
        current_lat DECIMAL(10, 8),
        current_long DECIMAL(11, 8),
        last_location_update TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Table Client Profiles (profils clients)
    console.log('Création de la table client_profiles...');
    await client.query(`
      CREATE TABLE client_profiles (
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

    // 6. Table Rides (courses)
    console.log('Création de la table rides...');
    await client.query(`
      CREATE TABLE rides (
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

    // 7. Table Maintenance (entretien véhicules)
    console.log('Création de la table maintenance...');
    await client.query(`
      CREATE TABLE maintenance (
        id SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        type_maintenance VARCHAR(100),
        cout DECIMAL(10, 2) NOT NULL,
        date_maintenance DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Création des index
    console.log('Création des index...');
    await client.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
      CREATE INDEX idx_rides_client ON rides(client_id);
      CREATE INDEX idx_rides_driver ON rides(driver_id);
      CREATE INDEX idx_rides_status ON rides(status);
      CREATE INDEX idx_driver_profiles_car ON driver_profiles(car_id);
    `);

    console.log('\nMigration terminée avec succès !');

  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();