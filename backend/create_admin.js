const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

/**
 * Script pour créer un compte administrateur
 * Usage: node create_admin.js
 */

const createAdmin = async () => {
  try {
    console.log('Création du compte administrateur...\n');

    // Données de l'admin
    const adminEmail = 'admin@taxitrack.com';
    const adminPassword = 'Admin123!'; // Mot de passe par défaut
    
    console.log('Email:', adminEmail);
    console.log('Mot de passe:', adminPassword);
    console.log('IMPORTANT: Changez ce mot de passe après la première connexion!\n');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Un utilisateur avec cet email existe déjà!');
      console.log('ID:', existingAdmin.rows[0].id);
      console.log('Email:', existingAdmin.rows[0].email);
      console.log('\n💡 Si vous voulez réinitialiser le mot de passe, supprimez d\'abord cet utilisateur.');
      process.exit(1);
    }

    // Hasher le mot de passe
    console.log('Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('Mot de passe hashé avec succès\n');

    // Insérer l'admin dans la base de données
    console.log('Insertion dans la base de données...');
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'admin')
       RETURNING id, email, role, created_at`,
      [adminEmail, hashedPassword]
    );

    const admin = result.rows[0];

    console.log('Compte administrateur créé avec succès!\n');
    console.log('Détails du compte:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Rôle:', admin.role);
    console.log('Créé le:', admin.created_at);
    console.log('\nVous pouvez maintenant vous connecter avec:');
    console.log('Email:', adminEmail);
    console.log('Mot de passe:', adminPassword);
    console.log('\nN\'oubliez pas de changer ce mot de passe après la première connexion!');

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error.message);
    process.exit(1);
  }
};

// Exécuter le script
createAdmin();