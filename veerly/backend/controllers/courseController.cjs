const db = require('../config/db.cjs');

// Récupérer les courses de l'utilisateur connecté
const getCourses = (req, res) => {
  const userId = req.user.id;
  console.log('Utilisateur authentifié :', req.user);

  // Requête qui récupère les courses de l'utilisateur connecté
  // ou toutes les courses si user_id est NULL (pour la compatibilité avec les anciennes données)
  const query = `
    SELECT * FROM courses
    WHERE user_id = ? OR user_id IS NULL
    ORDER BY date DESC, schedule ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des courses :', err);
      return res.status(500).send('Erreur lors de la récupération des courses');
    }
    
    console.log(`${results.length} courses trouvées pour l'utilisateur ${userId} (ou sans utilisateur associé)`);
    res.json(results);
  });
};

// Ajouter une course
const addCourse = (req, res) => {
  const {
    client_name,
    client_number,
    date,
    departure_location,
    arrival_location,
    schedule,
    vehicle_type,
    number_of_people,
    number_of_bags,
    bag_type,
    additional_notes,
  } = req.body;

  // Vérifier les champs obligatoires
  if (
    !client_name ||
    !client_number ||
    !date ||
    !departure_location ||
    !arrival_location ||
    !schedule ||
    !vehicle_type ||
    !number_of_people ||
    !number_of_bags
  ) {
    return res.status(400).send('Tous les champs obligatoires doivent être remplis');
  }

  // Récupérer l'ID de l'utilisateur depuis le token JWT
  const userId = req.user.id;

  const query = `
    INSERT INTO courses (
      client_name, client_number, date, departure_location, arrival_location,
      schedule, vehicle_type, number_of_people, number_of_bags, bag_type, additional_notes, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [
      client_name,
      client_number,
      date,
      departure_location,
      arrival_location,
      schedule,
      vehicle_type,
      number_of_people,
      number_of_bags,
      bag_type,
      additional_notes,
      userId // Ajout de l'ID utilisateur
    ],
    (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'ajout de la course :', err);
        return res.status(500).send('Erreur lors de l\'ajout de la course');
      }
      console.log('Course ajoutée avec succès, ID:', result.insertId);
      res.status(201).json({ 
        message: 'Course ajoutée avec succès', 
        id: result.insertId 
      });
    }
  );
};

// Supprimer une course
const deleteCourse = (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Tentative de suppression de la course ${courseId} par l'utilisateur ${userId}`);

  // Vérifiez d'abord si la course appartient à l'utilisateur (si vous avez implémenté user_id)
  // Ou supprimez directement si vous n'avez pas de colonne user_id
  const query = `
    DELETE FROM courses 
    WHERE id = ? 
    ${process.env.CHECK_USER_OWNERSHIP === 'true' ? 'AND (user_id = ? OR user_id IS NULL)' : ''}
  `;
  
  const queryParams = process.env.CHECK_USER_OWNERSHIP === 'true' 
    ? [courseId, userId]
    : [courseId];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression de la course:', err);
      return res.status(500).send('Erreur lors de la suppression de la course');
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send('Course non trouvée ou vous n\'avez pas les droits pour la supprimer');
    }
    
    console.log(`Course ${courseId} supprimée avec succès`);
    res.json({ message: 'Course supprimée avec succès' });
  });
};

module.exports = { getCourses, addCourse, deleteCourse };