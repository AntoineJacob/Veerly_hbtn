const db = require('../config/db.cjs');

// Obtenir tous les groupes de l'utilisateur connecté
const getGroups = (req, res) => {
  const userId = req.user.id;
  console.log('Récupération des groupes pour l\'utilisateur', userId);
  
  // Récupérer uniquement les groupes de l'utilisateur connecté
  db.query('SELECT * FROM `groups` WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la récupération des groupes:', err);
      return res.status(500).send('Erreur de récupération des groupes');
    }
    
    console.log(`${results.length} groupes récupérés pour l'utilisateur ${userId}`);
    res.json(results);
  });
};

// Ajouter un groupe
const addGroup = (req, res) => {
  const { group_name, collaborators } = req.body;
  const userId = req.user.id;
  
  console.log('Tentative d\'ajout du groupe:', { group_name, collaborators, userId });

  // Vérification que le nom du groupe est fourni
  if (!group_name) {
    console.log('Tentative d\'ajout d\'un groupe sans nom');
    return res.status(400).send('Le nom du groupe est obligatoire');
  }

  // Utiliser la structure exacte de votre table
  const query = 'INSERT INTO `groups` (group_name, collaborators, user_id) VALUES (?, ?, ?)';
  
  db.query(query, [group_name, collaborators, userId], (err, result) => {
    if (err) {
      console.error('Erreur SQL lors de l\'ajout du groupe:', err);
      return res.status(500).send('Erreur lors de l\'ajout du groupe');
    }
    
    console.log('Groupe ajouté avec succès, ID:', result.insertId);
    res.status(201).json({
      message: 'Groupe ajouté avec succès',
      group: {
        id: result.insertId,
        group_name: group_name,
        collaborators: collaborators,
        user_id: userId
      }
    });
  });
};

// Récupérer un groupe par ID
const getGroupById = (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Récupération du groupe ${groupId} pour l'utilisateur ${userId}`);
  
  // Vérifier que l'utilisateur est bien le propriétaire du groupe
  db.query('SELECT * FROM `groups` WHERE id = ? AND user_id = ?', [groupId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la récupération du groupe:', err);
      return res.status(500).send('Erreur lors de la récupération du groupe');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à y accéder');
    }
    
    console.log('Groupe récupéré avec succès');
    res.json(results[0]);
  });
};

// Mettre à jour un groupe
const updateGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { group_name, collaborators } = req.body;
  
  console.log(`Tentative de mise à jour du groupe ${groupId} par l'utilisateur ${userId}`);

  if (!group_name) {
    return res.status(400).send('Le nom du groupe est obligatoire');
  }

  // Vérifier d'abord que l'utilisateur est bien le propriétaire du groupe
  db.query('SELECT * FROM `groups` WHERE id = ? AND user_id = ?', [groupId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la vérification du groupe:', err);
      return res.status(500).send('Erreur lors de la mise à jour du groupe');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à le modifier');
    }
    
    // L'utilisateur est bien le propriétaire, on peut procéder à la mise à jour
    const updateQuery = 'UPDATE `groups` SET group_name = ?, collaborators = ? WHERE id = ?';
    
    db.query(updateQuery, [group_name, collaborators, groupId], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Erreur SQL lors de la mise à jour du groupe:', updateErr);
        return res.status(500).send('Erreur lors de la mise à jour du groupe');
      }
      
      console.log('Groupe mis à jour avec succès');
      res.json({
        message: 'Groupe mis à jour avec succès',
        group: {
          id: groupId,
          group_name: group_name,
          collaborators: collaborators,
          user_id: userId
        }
      });
    });
  });
};

// Supprimer un groupe
const deleteGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Tentative de suppression du groupe ${groupId} par l'utilisateur ${userId}`);

  // Vérifier d'abord que l'utilisateur est bien le propriétaire du groupe
  db.query('DELETE FROM `groups` WHERE id = ? AND user_id = ?', [groupId, userId], (err, result) => {
    if (err) {
      console.error('Erreur SQL lors de la suppression du groupe:', err);
      return res.status(500).send('Erreur lors de la suppression du groupe');
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à le supprimer');
    }
    
    console.log('Groupe supprimé avec succès');
    res.json({ message: 'Groupe supprimé avec succès' });
  });
};

module.exports = { 
  getGroups,
  addGroup,
  getGroupById,
  updateGroup,
  deleteGroup
};