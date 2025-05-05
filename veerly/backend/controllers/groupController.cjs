const db = require('../config/db.cjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Obtenir tous les groupes de l'utilisateur connecté (créés ou membre)
const getGroups = (req, res) => {
  const userId = req.user.id;
  console.log('Récupération des groupes pour l\'utilisateur', userId);
  
  // Récupérer les groupes dont l'utilisateur est propriétaire ou membre
  const query = `
    SELECT g.*, 
           CASE 
             WHEN g.user_id = ? THEN 'owner' 
             ELSE 'member' 
           END as user_role
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    WHERE g.user_id = ? OR gm.user_id = ?
    GROUP BY g.id
  `;
  
  db.query(query, [userId, userId, userId], (err, results) => {
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
  
  // Vérifier que l'utilisateur est soit le propriétaire du groupe, soit un membre du groupe
  const query = `
    SELECT g.*
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
    WHERE g.id = ? AND (g.user_id = ? OR gm.user_id IS NOT NULL)
  `;
  
  db.query(query, [userId, groupId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la récupération du groupe:', err);
      return res.status(500).send('Erreur lors de la récupération du groupe');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à y accéder');
    }
    
    // Récupérer les membres du groupe
    const memberQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             CASE WHEN g.user_id = u.id THEN 'owner' ELSE 'member' END as role
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      JOIN \`groups\` g ON gm.group_id = g.id
      WHERE gm.group_id = ?
      UNION
      SELECT u.id, u.first_name, u.last_name, u.email, 'owner' as role
      FROM \`groups\` g
      JOIN users u ON g.user_id = u.id
      WHERE g.id = ?
    `;
    
    db.query(memberQuery, [groupId, groupId], (memberErr, memberResults) => {
      if (memberErr) {
        console.error('Erreur SQL lors de la récupération des membres du groupe:', memberErr);
        // Renvoyer quand même les informations du groupe sans les membres
        console.log('Groupe récupéré avec succès');
        return res.json({...results[0], members: []});
      }
      
      // Ajouter les membres au résultat
      console.log('Groupe récupéré avec succès');
      res.json({...results[0], members: memberResults});
    });
  });
};

// Mettre à jour un groupe
const updateGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { group_name } = req.body;
  
  if (!group_name) {
    return res.status(400).send('Le nom du groupe est obligatoire');
  }
  
  db.query(
    'UPDATE `groups` SET group_name = ? WHERE id = ? AND user_id = ?',
    [group_name, groupId, userId],
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du groupe:', err);
        return res.status(500).send('Erreur lors de la mise à jour du groupe');
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à le modifier');
      }
      
      res.json({ message: 'Groupe mis à jour avec succès' });
    }
  );
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
    
    // Les invitations et références seront supprimées automatiquement grâce à la contrainte ON DELETE CASCADE
    console.log('Groupe supprimé avec succès');
    res.json({ message: 'Groupe supprimé avec succès' });
  });
};

// Inviter un utilisateur à rejoindre un groupe
const inviteToGroup = (req, res) => {
  const { groupId, email } = req.body;
  const userId = req.user.id;
  
  console.log(`Tentative d'invitation de ${email} au groupe ${groupId} par l'utilisateur ${userId}`);

  // Générer un token unique pour l'invitation
  const token = crypto.randomBytes(20).toString('hex');

  // Vérifier d'abord que l'utilisateur est bien le propriétaire du groupe
  db.query('SELECT * FROM `groups` WHERE id = ? AND user_id = ?', [groupId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la vérification du groupe:', err);
      return res.status(500).send('Erreur lors de l\'invitation');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Groupe non trouvé ou vous n\'êtes pas autorisé à inviter');
    }
    
    // Vérifier que l'utilisateur à inviter existe
    db.query('SELECT id FROM users WHERE email = ?', [email], (userErr, userResults) => {
      if (userErr) {
        console.error('Erreur SQL lors de la recherche de l\'utilisateur:', userErr);
        return res.status(500).send('Erreur lors de la recherche de l\'utilisateur');
      }
      
      if (userResults.length === 0) {
        return res.status(404).send('L\'utilisateur avec cet email n\'existe pas');
      }
      
      const invitedUserId = userResults[0].id;
      
      // Vérifier si l'invitation existe déjà
      db.query(
        'SELECT * FROM group_invitations WHERE group_id = ? AND user_id = ?',
        [groupId, invitedUserId],
        (inviteCheckErr, inviteCheckResults) => {
          if (inviteCheckErr) {
            console.error('Erreur SQL lors de la vérification de l\'invitation:', inviteCheckErr);
            return res.status(500).send('Erreur lors de la vérification de l\'invitation');
          }
          
          if (inviteCheckResults && inviteCheckResults.length > 0) {
            return res.status(400).send('Une invitation a déjà été envoyée à cet utilisateur');
          }
          
          // Créer l'invitation - inclure l'email et le token
          db.query(
            'INSERT INTO group_invitations (group_id, user_id, invited_by, email, token) VALUES (?, ?, ?, ?, ?)',
            [groupId, invitedUserId, userId, email, token],
            (createInviteErr) => {
              if (createInviteErr) {
                console.error('Erreur SQL lors de la création de l\'invitation:', createInviteErr);
                return res.status(500).send('Erreur lors de la création de l\'invitation');
              }
              
              // Vous pourriez envoyer un email à l'utilisateur avec le lien d'invitation
              // qui inclurait le token
              console.log(`Invitation envoyée à ${email} pour le groupe ${groupId} avec le token ${token}`);
              
              // Envoi d'un email d'invitation (optionnel)
              /* 
              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Invitation à rejoindre un groupe sur Veerly',
                html: `
                  <h2>Vous avez été invité à rejoindre un groupe sur Veerly</h2>
                  <p>Cliquez sur le lien suivant pour accepter l'invitation :</p>
                  <a href="${process.env.FRONTEND_URL}/accept-invitation/${token}">Accepter l'invitation</a>
                `
              };
              
              transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                  console.error('Erreur lors de l\'envoi de l\'email:', mailErr);
                } else {
                  console.log(`Email d'invitation envoyé à ${email}`);
                }
              });
              */
              
              res.status(201).json({ message: 'Invitation envoyée avec succès' });
            }
          );
        }
      );
    });
  });
};

// Récupérer les invitations en attente pour l'utilisateur connecté
const getPendingInvitations = (req, res) => {
  const userId = req.user.id;
  
  console.log('Récupération des invitations en attente pour l\'utilisateur', userId);
  
  const query = `
    SELECT gi.id, gi.group_id, gi.invited_by, gi.status, gi.created_at, gi.token,
           g.group_name, u.email as inviter_email, u.first_name as inviter_first_name, u.last_name as inviter_last_name
    FROM group_invitations gi
    JOIN \`groups\` g ON gi.group_id = g.id
    JOIN users u ON gi.invited_by = u.id
    WHERE gi.user_id = ? AND gi.status = 'pending'
    ORDER BY gi.created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la récupération des invitations:', err);
      return res.status(500).send('Erreur lors de la récupération des invitations');
    }
    
    console.log(`${results.length} invitations en attente récupérées pour l'utilisateur ${userId}`);
    res.json(results);
  });
};

// Accepter une invitation
const acceptInvitation = (req, res) => {
  const invitationId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Tentative d'acceptation de l'invitation ${invitationId} par l'utilisateur ${userId}`);
  
  // Vérifier que l'invitation appartient bien à l'utilisateur
  db.query('SELECT * FROM group_invitations WHERE id = ? AND user_id = ?', [invitationId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la vérification de l\'invitation:', err);
      return res.status(500).send('Erreur lors de l\'acceptation de l\'invitation');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Invitation non trouvée ou non autorisée');
    }
    
    const invitation = results[0];
    
    // Mettre à jour le statut de l'invitation
    db.query('UPDATE group_invitations SET status = "accepted" WHERE id = ?', [invitationId], (updateErr) => {
      if (updateErr) {
        console.error('Erreur SQL lors de la mise à jour de l\'invitation:', updateErr);
        return res.status(500).send('Erreur lors de l\'acceptation de l\'invitation');
      }
      
      // Ajouter l'utilisateur comme membre du groupe
      db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [invitation.group_id, userId], (memberErr) => {
        if (memberErr) {
          console.error('Erreur SQL lors de l\'ajout du membre au groupe:', memberErr);
          return res.status(500).send('Erreur lors de l\'ajout au groupe');
        }
        
        console.log(`Invitation ${invitationId} acceptée et utilisateur ${userId} ajouté au groupe ${invitation.group_id}`);
        res.json({ message: 'Invitation acceptée avec succès' });
      });
    });
  });
};

// Refuser une invitation
const rejectInvitation = (req, res) => {
  const invitationId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Tentative de refus de l'invitation ${invitationId} par l'utilisateur ${userId}`);
  
  // Vérifier que l'invitation appartient bien à l'utilisateur
  db.query('SELECT * FROM group_invitations WHERE id = ? AND user_id = ?', [invitationId, userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la vérification de l\'invitation:', err);
      return res.status(500).send('Erreur lors du refus de l\'invitation');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Invitation non trouvée ou non autorisée');
    }
    
    // Mettre à jour le statut de l'invitation
    db.query('UPDATE group_invitations SET status = "rejected" WHERE id = ?', [invitationId], (updateErr) => {
      if (updateErr) {
        console.error('Erreur SQL lors de la mise à jour de l\'invitation:', updateErr);
        return res.status(500).send('Erreur lors du refus de l\'invitation');
      }
      
      console.log(`Invitation ${invitationId} refusée par l'utilisateur ${userId}`);
      res.json({ message: 'Invitation refusée avec succès' });
    });
  });
};

module.exports = { 
  getGroups,
  addGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  inviteToGroup,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation
};