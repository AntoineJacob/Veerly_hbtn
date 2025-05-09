import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    group_name: '', 
    collaborators: '' 
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    groupId: null,
    invitingGroup: null
  });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    fetchGroups();
    fetchInvitations();
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/groups/get-groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/groups/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInvitations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInviteChange = (e) => {
    setInviteData({ ...inviteData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('/api/groups/add-group', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  const showInvite = (group) => {
    setInviteData({
      email: '',
      groupId: group.id,
      invitingGroup: group.group_name
    });
    setShowInviteForm(true);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/groups/invite`, {
        groupId: inviteData.groupId,
        email: inviteData.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Invitation envoyée à ${inviteData.email}`);
      setShowInviteForm(false);
      setInviteData({ email: '', groupId: null, invitingGroup: null });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de l\'envoi de l\'invitation');
      }
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/groups/accept-invitation/${invitationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Invitation acceptée avec succès');
      fetchInvitations();
      fetchGroups();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de l\'acceptation de l\'invitation');
      }
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/groups/reject-invitation/${invitationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Invitation refusée');
      fetchInvitations();
    } catch (error) {
      console.error('Erreur lors du refus de l\'invitation:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors du refus de l\'invitation');
      }
    }
  };

  const viewCourses = (groupId) => {
    navigate(`/courses/${groupId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Gestion des Groupes</h1>
      
      {showInviteForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Inviter un collaborateur à rejoindre "{inviteData.invitingGroup}"
          </h2>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email du collaborateur:
              </label>
              <input
                type="email"
                name="email"
                value={inviteData.email}
                onChange={handleInviteChange}
                placeholder="exemple@email.com"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors">
                Envoyer l'invitation
              </button>
              <button 
                type="button" 
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setShowInviteForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Créer un nouveau groupe</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du groupe:
              </label>
              <input
                type="text"
                name="group_name"
                value={formData.group_name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle):
              </label>
              <textarea
                name="collaborators"
                value={formData.collaborators}
                onChange={handleChange}
                placeholder="Description du groupe"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-24"
              ></textarea>
            </div>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors">
              Créer le groupe
            </button>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Vos groupes</h2>
        {groups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du groupe</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.collaborators || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => viewCourses(group.id)}
                        className="bg-secondary text-white py-1 px-3 rounded mr-2 hover:bg-secondary-dark transition-colors"
                      >
                        Voir les courses
                      </button>
                      <button 
                        onClick={() => showInvite(group)}
                        className="bg-primary text-white py-1 px-3 rounded mr-2 hover:bg-primary-dark transition-colors"
                      >
                        Inviter
                      </button>
                      <button 
                        onClick={() => handleDelete(group.id)}
                        className="bg-danger text-white py-1 px-3 rounded hover:bg-danger-dark transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 italic">Vous n'avez pas encore créé de groupe</p>
        )}
      </div>

      {/* Section des invitations en attente */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Invitations reçues</h2>
        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium">Invitation à rejoindre {invitation.group_name}</h3>
                  <p className="text-sm text-gray-600">De: {invitation.inviter_first_name} {invitation.inviter_last_name} ({invitation.inviter_email})</p>
                  <p className="text-xs text-gray-500">Date: {new Date(invitation.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors"
                  >
                    Accepter
                  </button>
                  <button 
                    onClick={() => handleRejectInvitation(invitation.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 italic">Aucune invitation en attente</p>
        )}
      </div>
    </div>
  );
}

export default Groups;