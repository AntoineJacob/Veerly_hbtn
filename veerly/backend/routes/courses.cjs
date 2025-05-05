const express = require('express');
const { authenticateToken } = require('../middleware/auth.cjs');
const { 
  getGroupCourses, 
  getGroupCoursesByStatus,
  addGroupCourse,
  deleteGroupCourse,
  assignCourse,
  startCourse,
  completeCourse,
  unassignCourse,
  getGroupDrivers,
  getCourseReceipt,
  sendReceiptByEmail
} = require('../controllers/courseController.cjs');

const router = express.Router();

// Routes pour les courses par groupe
router.get('/group/:groupId', authenticateToken, getGroupCourses);
router.get('/group/:groupId/by-status', authenticateToken, getGroupCoursesByStatus);
router.post('/group/:groupId', authenticateToken, addGroupCourse);
router.delete('/group/:groupId/:courseId', authenticateToken, deleteGroupCourse);

// Routes pour les chauffeurs
router.get('/group/:groupId/drivers', authenticateToken, getGroupDrivers);

// Routes pour la gestion des courses
router.post('/:courseId/assign', authenticateToken, assignCourse);
router.post('/:courseId/start', authenticateToken, startCourse);
router.post('/:courseId/complete', authenticateToken, completeCourse);
router.post('/:courseId/unassign', authenticateToken, unassignCourse);

// Route pour récupérer les données du bon de réservation
router.get('/:courseId/receipt', authenticateToken, getCourseReceipt);
// Route pour envoyer le bon de réservation par email
router.post('/:courseId/send-receipt', authenticateToken, sendReceiptByEmail);

module.exports = router;