const db = require('../config/db.cjs');
const bcrypt = require('bcrypt');

// Obtenir les informations du profil utilisateur
const getProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT id, email, first_name, last_name, vehicle_type, 
     license_plate, capacity, created_at 
     FROM users WHERE id = ?`, 
    [userId], 
    (err, results) => {
      if (err) {
        console.error('Erreur SQL lors de la récupération du profil:', err);
        return res.status(500).send('Erreur lors de la récupération du profil');
      }
      if (results.length === 0) return res.status(404).send('Profil non trouvé');
      
      console.log('Profil récupéré pour l\'utilisateur', userId);
      res.json(results[0]);
    }
  );
};

// Récupérer l'historique des courses de l'utilisateur
const getCourseHistory = (req, res) => {
  const userId = req.user.id;
  
  // Adapter cette requête selon la structure de votre table courses
  const query = `
    SELECT * 
    FROM courses 
    ORDER BY date DESC, schedule ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'historique des courses:', err);
      return res.status(500).send('Erreur lors de la récupération de l\'historique');
    }
    
    console.log(`${results.length} courses trouvées`);
    res.json(results);
  });
};

// Mettre à jour les informations du profil utilisateur
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { 
    email, 
    first_name, 
    last_name, 
    vehicle_type, 
    license_plate, 
    capacity 
  } = req.body;

  const updates = [];
  const values = [];

  // Vérification et ajout de chaque champ s'il est fourni
  if (email) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).send('Format d\'email invalide');
    }
    updates.push('email = ?');
    values.push(email);
  }

  if (first_name) {
    updates.push('first_name = ?');
    values.push(first_name);
  }

  if (last_name) {
    updates.push('last_name = ?');
    values.push(last_name);
  }

  if (vehicle_type) {
    updates.push('vehicle_type = ?');
    values.push(vehicle_type);
  }

  if (license_plate) {
    updates.push('license_plate = ?');
    values.push(license_plate);
  }

  if (capacity) {
    updates.push('capacity = ?');
    values.push(parseInt(capacity));
  }

  // Si aucun champ n'est fourni
  if (updates.length === 0) {
    return res.status(400).send('Aucune donnée à mettre à jour');
  }

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      return res.status(500).send('Erreur lors de la mise à jour du profil');
    }
    
    console.log('Profil mis à jour pour l\'utilisateur', userId);
    res.json({ message: 'Profil mis à jour avec succès' });
  });
};

// Mettre à jour le mot de passe
const updatePassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).send('Le mot de passe actuel et le nouveau mot de passe sont requis');
  }

  if (newPassword.length < 6) {
    return res.status(400).send('Le nouveau mot de passe doit contenir au moins 6 caractères');
  }

  // Vérifier le mot de passe actuel
  db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du mot de passe:', err);
      return res.status(500).send('Erreur lors de la mise à jour du mot de passe');
    }

    if (results.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    const user = results[0];

    // Comparer le mot de passe actuel
    bcrypt.compare(currentPassword, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Erreur lors de la comparaison des mots de passe:', compareErr);
        return res.status(500).send('Erreur lors de la vérification du mot de passe');
      }

      if (!isMatch) {
        return res.status(400).send('Le mot de passe actuel est incorrect');
      }

      // Hacher le nouveau mot de passe
      const saltRounds = 10;
      bcrypt.hash(newPassword, saltRounds, (hashErr, hash) => {
        if (hashErr) {
          console.error('Erreur lors du hachage du mot de passe:', hashErr);
          return res.status(500).send('Erreur lors du hachage du mot de passe');
        }

        // Mettre à jour le mot de passe
        db.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId], (updateErr) => {
          if (updateErr) {
            console.error('Erreur lors de la mise à jour du mot de passe:', updateErr);
            return res.status(500).send('Erreur lors de la mise à jour du mot de passe');
          }

          console.log('Mot de passe mis à jour pour l\'utilisateur', userId);
          res.json({ message: 'Mot de passe mis à jour avec succès' });
        });
      });
    });
  });
};

module.exports = { 
  getProfile, 
  updateProfile, 
  getCourseHistory, 
  updatePassword 
};