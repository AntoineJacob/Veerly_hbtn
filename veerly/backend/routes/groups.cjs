const express = require('express');
const router = express.Router();
const { 
  getGroups, 
  addGroup, 
  getGroupById, 
  updateGroup, 
  deleteGroup 
} = require('../controllers/groupController.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

// Obtenir tous les groupes
router.get('/get-groups', authenticateToken, getGroups);

// Ajouter un groupe
router.post('/add-group', authenticateToken, addGroup);

// Récupérer un groupe par ID
router.get('/get-group/:id', authenticateToken, getGroupById);

// Mettre à jour un groupe
router.put('/update-group/:id', authenticateToken, updateGroup);

// Supprimer un groupe
router.delete('/delete-group/:id', authenticateToken, deleteGroup);

module.exports = router;