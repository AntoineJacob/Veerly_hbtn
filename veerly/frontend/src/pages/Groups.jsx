import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ 
    group_name: '', 
    collaborators: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    fetchGroups();
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Récupération des groupes en cours...');
      
      const response = await axios.get('/api/groups/get-groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Groupes récupérés:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        console.error('Statut:', error.response.status);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Envoi des données du formulaire:', formData);
      
      const response = await axios.post('/api/groups/add-group', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Réponse du serveur:', response.data);
      alert('Groupe ajouté avec succès');
      
      // Réinitialiser le formulaire
      setFormData({ group_name: '', collaborators: '' });
      
      // Rafraîchir la liste des groupes
      fetchGroups();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du groupe:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de l\'ajout du groupe');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/groups/delete-group/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Groupe supprimé avec succès');
      fetchGroups();
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de la suppression du groupe');
      }
    }
  };

  const handleEdit = (group) => {
    // Rediriger vers la page d'édition ou ouvrir un modal
    // Ici, on définit simplement les valeurs dans le formulaire actuel
    setFormData({
      group_name: group.group_name,
      collaborators: group.collaborators,
      id: group.id // Pour garder une trace de l'ID lors de la mise à jour
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.id) {
      // C'est une création, pas une mise à jour
      handleSubmit(e);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/groups/update-group/${formData.id}`, {
        group_name: formData.group_name,
        collaborators: formData.collaborators
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Réponse du serveur:', response.data);
      alert('Groupe mis à jour avec succès');
      
      // Réinitialiser le formulaire
      setFormData({ group_name: '', collaborators: '' });
      
      // Rafraîchir la liste des groupes
      fetchGroups();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de la mise à jour du groupe');
      }
    }
  };

  return (
    <div className="container">
      <h1>Gestion des Groupes</h1>
      
      <div className="form-container">
        <h2>{formData.id ? 'Modifier le Groupe' : 'Ajouter un Groupe'}</h2>
        <form onSubmit={formData.id ? handleUpdate : handleSubmit}>
          <div className="form-group">
            <label>Nom du groupe:</label>
            <input
              type="text"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Collaborateurs:</label>
            <textarea
              name="collaborators"
              value={formData.collaborators}
              onChange={handleChange}
              placeholder="Liste des collaborateurs (séparés par des virgules)"
              required
            ></textarea>
          </div>
          
          <div className="form-buttons">
            <button type="submit">
              {formData.id ? 'Mettre à jour' : 'Ajouter'}
            </button>
            
            {formData.id && (
              <button 
                type="button" 
                onClick={() => setFormData({ group_name: '', collaborators: '' })}
                className="cancel-btn"
              >
                Annuler la modification
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="table-container">
        <h2>Groupes disponibles</h2>
        {groups.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du groupe</th>
                <th>Collaborateurs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.id}</td>
                  <td>{group.group_name}</td>
                  <td>{group.collaborators}</td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(group)}
                    >
                      Modifier
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(group.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucun groupe disponible</p>
        )}
      </div>
    </div>
  );
}

export default Groups;