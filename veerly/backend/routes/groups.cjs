const express = require('express');
const router = express.Router();
const { 
  getGroups, 
  addGroup, 
  getGroupById, 
  updateGroup, 
  deleteGroup,
  inviteToGroup,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation
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

// Inviter un utilisateur à rejoindre un groupe
router.post('/invite', authenticateToken, inviteToGroup);

// Obtenir les invitations en attente
router.get('/invitations', authenticateToken, getPendingInvitations);

// Accepter une invitation
router.put('/accept-invitation/:id', authenticateToken, acceptInvitation);

// Refuser une invitation
router.put('/reject-invitation/:id', authenticateToken, rejectInvitation);

module.exports = router;