const { Client } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
  // Connexion en tant que postgres (superuser par défaut)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Base par défaut
    user: 'postgres', // Utilisateur par défaut
    password: 'postgres', // À adapter selon votre installation
  });

  try {
    await client.connect();
    console.log('Connexion à PostgreSQL établie');

    const dbName = process.env.DB_NAME || 'taxitrack_db';
    const dbUser = process.env.DB_USER || 'taxitrack_user';
    const dbPassword = process.env.DB_PASSWORD || 'taxitrack_password';

    // Création de l'utilisateur s'il n'existe pas
    console.log(`Création de l'utilisateur ${dbUser}...`);
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${dbUser}') THEN
          CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';
        END IF;
      END $$;
    `);

    // Création de la base de données s'il n'existe pas
    console.log(`🔧 Création de la base de données ${dbName}...`);
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName};`);
      console.log(`Base de données ${dbName} créée`);
    } else {
      console.log(`La base ${dbName} existe déjà`);
    }

    // Donner les privilèges
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`);

    console.log('\nSetup terminé avec succès !');
    console.log(`\nInformations de connexion :`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${dbUser}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log('\nProchaine étape : npm run db:migrate');

  } catch (error) {
    console.error('Erreur lors du setup:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

setupDatabase();