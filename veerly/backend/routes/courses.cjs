const express = require('express');
const router = express.Router();
const { getCourses, addCourse, deleteCourse } = require('../controllers/courseController.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

// Obtenir toutes les courses
router.get('/get-courses', authenticateToken, getCourses);

// Ajouter une course
router.post('/add-course', authenticateToken, addCourse);

// Supprimer une course
router.delete('/delete-course/:id', authenticateToken, deleteCourse);

module.exports = router;