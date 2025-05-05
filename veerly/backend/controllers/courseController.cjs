const db = require('../config/db.cjs');

// Récupérer les courses de l'utilisateur connecté
const getCourses = (req, res) => {
  const userId = req.user.id;
  console.log('Utilisateur authentifié :', req.user);

  // Requête qui récupère les courses de l'utilisateur connecté
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
      userId
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

// Récupérer toutes les courses d'un groupe
const getGroupCourses = (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  
  // Vérifier que l'utilisateur est soit le propriétaire du groupe, soit un membre du groupe
  const checkAccessQuery = `
    SELECT 1
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
    WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
  `;
  
  db.query(checkAccessQuery, [userId, groupId, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).send('Erreur lors de la vérification des droits d\'accès');
    }
    
    if (checkResults.length === 0) {
      return res.status(403).send('Vous n\'avez pas accès à ce groupe');
    }
    
    // L'utilisateur a accès, récupérer les courses du groupe
    db.query('SELECT * FROM courses WHERE group_id = ?', [groupId], (err, results) => {
      if (err) {
        return res.status(500).send('Erreur lors de la récupération des courses');
      }
      
      res.json(results);
    });
  });
};

// Récupérer les courses d'un groupe par statut
const getGroupCoursesByStatus = (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  
  // Vérifier que l'utilisateur est soit le propriétaire du groupe, soit un membre du groupe
  const checkAccessQuery = `
    SELECT 1
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
    WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
  `;
  
  db.query(checkAccessQuery, [userId, groupId, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).send('Erreur lors de la vérification des droits d\'accès');
    }
    
    if (checkResults.length === 0) {
      return res.status(403).send('Vous n\'avez pas accès à ce groupe');
    }
    
    // L'utilisateur a accès, récupérer les courses du groupe regroupées par statut
    const query = `
      SELECT 
        c.*,
        u.first_name as driver_first_name,
        u.last_name as driver_last_name,
        u.email as driver_email
      FROM courses c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.group_id = ?
      ORDER BY c.date ASC, c.schedule ASC
    `;
    
    db.query(query, [groupId], (err, results) => {
      if (err) {
        return res.status(500).send('Erreur lors de la récupération des courses');
      }
      
      // Organiser les courses par statut
      const coursesByStatus = {
        available: results.filter(course => course.status === 'Disponible' || !course.status),
        assigned: results.filter(course => course.status === 'Prise en charge'),
        in_progress: results.filter(course => course.status === 'En cours'),
        completed: results.filter(course => course.status === 'Terminée')
      };
      
      res.json(coursesByStatus);
    });
  });
};

// Ajouter une course dans un groupe
const addGroupCourse = (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  
  const {
    client_name, client_number, date, departure_location, arrival_location,
    schedule, vehicle_type, number_of_people, number_of_bags, bag_type, 
    additional_notes
  } = req.body;
  
  // Vérifier que l'utilisateur a accès au groupe
  const checkAccessQuery = `
    SELECT 1
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
    WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
  `;
  
  db.query(checkAccessQuery, [userId, groupId, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).send('Erreur lors de la vérification des droits d\'accès');
    }
    
    if (checkResults.length === 0) {
      return res.status(403).send('Vous n\'avez pas accès à ce groupe');
    }
    
    // Vérification des champs obligatoires
    if (!client_name || !client_number || !date || !departure_location || 
        !arrival_location || !schedule || !vehicle_type) {
      return res.status(400).send('Tous les champs obligatoires doivent être remplis');
    }
    
    // Ajouter la course avec le groupe_id
    db.query(`
      INSERT INTO courses (
        client_name, client_number, date, departure_location, arrival_location,
        schedule, vehicle_type, number_of_people, number_of_bags, bag_type, 
        additional_notes, group_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "Disponible")
    `, [
      client_name, client_number, date, departure_location, arrival_location,
      schedule, vehicle_type, number_of_people, number_of_bags, bag_type, 
      additional_notes, groupId
    ], (insertErr, result) => {
      if (insertErr) {
        return res.status(500).send('Erreur lors de l\'ajout de la course');
      }
      
      res.status(201).json({ 
        message: 'Course ajoutée avec succès',
        id: result.insertId
      });
    });
  });
};

// Supprimer une course d'un groupe
const deleteGroupCourse = (req, res) => {
  const { groupId, courseId } = req.params;
  const userId = req.user.id;
  
  // Vérifier les droits d'accès
  const checkAccessQuery = `
    SELECT 1
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
    WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
  `;
  
  db.query(checkAccessQuery, [userId, groupId, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).send('Erreur lors de la vérification des droits d\'accès');
    }
    
    if (checkResults.length === 0) {
      return res.status(403).send('Vous n\'avez pas accès à ce groupe');
    }
    
    // Supprimer la course
    db.query(
      'DELETE FROM courses WHERE id = ? AND group_id = ?',
      [courseId, groupId],
      (deleteErr, result) => {
        if (deleteErr) {
          return res.status(500).send('Erreur lors de la suppression de la course');
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).send('Course non trouvée dans ce groupe');
        }
        
        res.json({ message: 'Course supprimée avec succès' });
      }
    );
  });
};

// Prendre en charge une course
const assignCourse = (req, res) => {
  const courseId = req.params.courseId;
  const driverId = req.user.id;
  
  // Vérifier que la course existe et est disponible
  db.query(
    'SELECT * FROM courses WHERE id = ? AND status = "Disponible"',
    [courseId],
    (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).send('Erreur lors de la vérification de la course');
      }
      
      if (checkResults.length === 0) {
        return res.status(404).send('Course non trouvée ou déjà prise en charge');
      }
      
      const course = checkResults[0];
      const groupId = course.group_id;
      
      // Vérifier que l'utilisateur est membre du groupe
      const checkMemberQuery = `
        SELECT 1
        FROM \`groups\` g
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
        WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
      `;
      
      db.query(checkMemberQuery, [driverId, groupId, driverId], (memberErr, memberResults) => {
        if (memberErr) {
          return res.status(500).send('Erreur lors de la vérification des droits');
        }
        
        if (memberResults.length === 0) {
          return res.status(403).send('Vous n\'avez pas accès à cette course');
        }
        
        // Mettre à jour le statut de la course et attribuer le chauffeur
        db.query(
          'UPDATE courses SET status = "Prise en charge", user_id = ? WHERE id = ?',
          [driverId, courseId],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).send('Erreur lors de la prise en charge de la course');
            }
            
            res.json({ message: 'Course prise en charge avec succès' });
          }
        );
      });
    }
  );
};

// Démarrer une course
const startCourse = (req, res) => {
  const courseId = req.params.courseId;
  const driverId = req.user.id;
  
  // Vérifier que la course existe et est attribuée à ce chauffeur
  db.query(
    'SELECT * FROM courses WHERE id = ? AND user_id = ? AND status = "Prise en charge"',
    [courseId, driverId],
    (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).send('Erreur lors de la vérification de la course');
      }
      
      if (checkResults.length === 0) {
        return res.status(404).send('Course non trouvée ou vous n\'êtes pas autorisé à la démarrer');
      }
      
      const now = new Date();
      
      // Mettre à jour le statut de la course
      db.query(
        'UPDATE courses SET status = "En cours", start_time = ? WHERE id = ?',
        [now, courseId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).send('Erreur lors du démarrage de la course');
          }
          
          res.json({ message: 'Course démarrée avec succès', start_time: now });
        }
      );
    }
  );
};

// Terminer une course
const completeCourse = (req, res) => {
  const courseId = req.params.courseId;
  const driverId = req.user.id;
  
  // Vérifier que la course existe et est en cours par ce chauffeur
  db.query(
    'SELECT * FROM courses WHERE id = ? AND user_id = ? AND status = "En cours"',
    [courseId, driverId],
    (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).send('Erreur lors de la vérification de la course');
      }
      
      if (checkResults.length === 0) {
        return res.status(404).send('Course non trouvée ou vous n\'êtes pas autorisé à la terminer');
      }
      
      const now = new Date();
      
      // Mettre à jour le statut de la course
      db.query(
        'UPDATE courses SET status = "Terminée", end_time = ? WHERE id = ?',
        [now, courseId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).send('Erreur lors de la finalisation de la course');
          }
          
          res.json({ message: 'Course terminée avec succès', end_time: now });
        }
      );
    }
  );
};

// Annuler la prise en charge d'une course
const unassignCourse = (req, res) => {
  const courseId = req.params.courseId;
  const driverId = req.user.id;
  
  // Vérifier que la course existe et est attribuée à ce chauffeur
  db.query(
    'SELECT * FROM courses WHERE id = ? AND user_id = ? AND status = "Prise en charge"',
    [courseId, driverId],
    (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).send('Erreur lors de la vérification de la course');
      }
      
      if (checkResults.length === 0) {
        return res.status(404).send('Course non trouvée ou vous n\'êtes pas autorisé à annuler la prise en charge');
      }
      
      // Mettre à jour le statut de la course
      db.query(
        'UPDATE courses SET status = "Disponible", user_id = NULL WHERE id = ?',
        [courseId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).send('Erreur lors de l\'annulation de la prise en charge');
          }
          
          res.json({ message: 'Prise en charge annulée avec succès' });
        }
      );
    }
  );
};

// Récupérer les chauffeurs d'un groupe
const getGroupDrivers = (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  
  // Vérifier que l'utilisateur est bien l'administrateur du groupe
  db.query(
    'SELECT 1 FROM `groups` WHERE id = ? AND user_id = ?',
    [groupId, userId],
    (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).send('Erreur lors de la vérification des droits d\'accès');
      }
      
      if (checkResults.length === 0) {
        return res.status(403).send('Vous n\'êtes pas l\'administrateur de ce groupe');
      }
      
      // L'utilisateur est bien l'admin, récupérer tous les chauffeurs du groupe
      const query = `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'Terminée') as completed_rides,
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'En cours') as active_rides,
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'Prise en charge') as assigned_rides
        FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        WHERE gm.group_id = ?
        UNION
        SELECT u.id, u.first_name, u.last_name, u.email,
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'Terminée') as completed_rides,
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'En cours') as active_rides,
               (SELECT COUNT(*) FROM courses WHERE user_id = u.id AND group_id = ? AND status = 'Prise en charge') as assigned_rides
        FROM users u
        JOIN \`groups\` g ON u.id = g.user_id
        WHERE g.id = ?
        ORDER BY last_name ASC, first_name ASC
      `;
      
      db.query(query, [groupId, groupId, groupId, groupId, groupId, groupId, groupId, groupId], (err, results) => {
        if (err) {
          return res.status(500).send('Erreur lors de la récupération des chauffeurs');
        }
        
        // Ajouter des statistiques sur les courses du groupe
        db.query(
          'SELECT COUNT(*) as total, status FROM courses WHERE group_id = ? GROUP BY status',
          [groupId],
          (statErr, statResults) => {
            if (statErr) {
              return res.json({ drivers: results, stats: {} });
            }
            
            const stats = {};
            statResults.forEach(stat => {
              stats[stat.status] = stat.total;
            });
            
            res.json({ drivers: results, stats });
          }
        );
      });
    }
  );
};

// Récupérer les données pour le bon de réservation
const getCourseReceipt = async (req, res) => {
  const courseId = req.params.courseId;
  
  try {
    // Récupérer les détails complets de la course
    const query = `
      SELECT 
        c.*,
        u.first_name as driver_first_name,
        u.last_name as driver_last_name,
        u.email as driver_email,
        g.group_name
      FROM courses c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN \`groups\` g ON c.group_id = g.id
      WHERE c.id = ?
    `;
    
    db.query(query, [courseId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des données du bon de réservation:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Course non trouvée' });
      }
      
      // Ne pas définir de prix par défaut, laissons l'utilisateur le définir
      const courseData = results[0];
      
      res.json(courseData);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Envoyer le bon de réservation par email
const sendReceiptByEmail = async (req, res) => {
  const courseId = req.params.courseId;
  const { email, price } = req.body; // Récupérer l'email et le prix éventuellement modifié
  
  try {
    // Récupérer les détails de la course
    const query = `
      SELECT 
        c.*,
        u.first_name as driver_first_name,
        u.last_name as driver_last_name,
        u.email as driver_email,
        g.group_name
      FROM courses c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN \`groups\` g ON c.group_id = g.id
      WHERE c.id = ?
    `;
    
    db.query(query, [courseId], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des données du bon de réservation:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Course non trouvée' });
      }
      
      const course = results[0];
      
      // Utiliser le prix mis à jour si fourni, sinon utiliser le prix actuel ou la valeur par défaut
      const receiptPrice = price || course.price || '60';
      
      // Si le prix a été mis à jour, le sauvegarder dans la base de données
      if (price && price !== course.price) {
        db.query('UPDATE courses SET price = ? WHERE id = ?', [price, courseId]);
      }
      
      const recipientEmail = email || course.client_email || course.client_number + '@example.com'; // Fallback si pas d'email
      
      // Ici implémentez l'envoi d'email avec nodemailer...
      
      // Pour l'instant, simulons un succès
      console.log(`Email would be sent to ${recipientEmail} for course #${courseId} with price ${receiptPrice}€`);
      
      res.json({ success: true, message: 'Bon de réservation envoyé par email' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { 
  getCourses, 
  addCourse, 
  deleteCourse, 
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
};