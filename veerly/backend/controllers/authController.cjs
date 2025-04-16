const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs');
const jwtConfig = require('../config/jwt-config.cjs');

const saltRounds = 10;

// Inscription
const register = (req, res) => {
  const { email, password, first_name, last_name, vehicle_type, license_plate, capacity } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis');
  }

  console.log('Requête reçue pour l\'inscription :', req.body);

  // Vérifier si l'utilisateur existe déjà
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur :', err);
      return res.status(500).send('Erreur lors de la vérification de l\'utilisateur');
    }

    if (results.length > 0) {
      console.log('Utilisateur déjà existant');
      return res.status(400).send('Utilisateur déjà existant');
    }

    // Hacher le mot de passe
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        return res.status(500).send('Erreur lors du hachage du mot de passe');
      }

      console.log('Mot de passe haché avec succès');

      // Insérer l'utilisateur dans la base de données
      const query = `
        INSERT INTO users (email, password, first_name, last_name, vehicle_type, license_plate, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [email, hash, first_name, last_name, vehicle_type, license_plate, capacity];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
          return res.status(500).send('Erreur lors de l\'inscription');
        }
        console.log('Utilisateur inscrit avec succès');
        res.status(201).send('Utilisateur inscrit avec succès');
      });
    });
  });
};

// Connexion
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis');
  }

  // Vérifier si l'utilisateur existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).send('Erreur lors de la vérification de l\'utilisateur');
    }
    
    if (results.length === 0) {
      return res.status(401).send('Email ou mot de passe incorrect');
    }

    const user = results[0];

    // Comparer le mot de passe
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Erreur bcrypt:', err);
        return res.status(500).send('Erreur lors de la vérification du mot de passe');
      }
      
      if (!isMatch) {
        return res.status(401).send('Email ou mot de passe incorrect');
      }

      // Afficher un aperçu sécurisé de la clé pour le débogage
      console.log('Clé secrète utilisée pour la signature:', jwtConfig.secretKey.substring(0, 5) + '***');

      // Générer un token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtConfig.secretKey,
        { expiresIn: '24h' }
      );
      
      console.log('Token généré avec succès pour', user.email);
      res.json({ token });
    });
  });
};

module.exports = {
  register,
  login
};