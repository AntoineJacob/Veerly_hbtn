const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.cjs');
const { 
  getProfile, 
  updateProfile, 
  getCourseHistory, 
  updatePassword 
} = require('../controllers/profileController.cjs');

// Récupérer les informations du profil
router.get('/', authenticateToken, getProfile);

// Récupérer l'historique des courses
router.get('/course-history', authenticateToken, getCourseHistory);

// Mettre à jour les informations du profil
router.put('/update', authenticateToken, updateProfile);

// Mettre à jour le mot de passe
router.put('/update-password', authenticateToken, updatePassword);

module.exports = router;