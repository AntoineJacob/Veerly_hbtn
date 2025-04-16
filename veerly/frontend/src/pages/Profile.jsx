import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css'; // Assurez-vous de créer ce fichier

function Profile() {
  const [profile, setProfile] = useState(null);
  const [courseHistory, setCourseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    fetchProfileData();
    fetchCourseHistory();
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      setError('Impossible de charger les informations du profil');
      setLoading(false);
    }
  };

  const fetchCourseHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile/course-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCourseHistory(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(formData);
      setEditMode(false);
      alert('Profil mis à jour avec succès');
      fetchProfileData(); // Recharger les données pour être sûr
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Mot de passe mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert('Erreur lors de la mise à jour du mot de passe');
      }
    }
  };

  if (loading) {
    return <div className="profile-container">Chargement...</div>;
  }

  if (error) {
    return <div className="profile-container error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>
      
      <div className="profile-header">
        <div className="profile-info">
          <h2>{profile.first_name || ''} {profile.last_name || ''}</h2>
          <p className="email">{profile.email}</p>
          <p className="member-since">Membre depuis: {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="profile-actions">
          <button 
            className={editMode ? "cancel-btn" : "edit-btn"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Annuler' : 'Modifier le profil'}
          </button>
          <button 
            className={showPasswordForm ? "cancel-btn" : "password-btn"}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>
      
      {showPasswordForm ? (
        <div className="password-form">
          <h2>Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Mot de passe actuel:</label>
              <input 
                type="password" 
                name="currentPassword" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe:</label>
              <input 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau mot de passe:</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="submit-btn">Changer le mot de passe</button>
          </form>
        </div>
      ) : editMode ? (
        <div className="profile-form">
          <h2>Modifier vos informations</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Prénom:</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name || ''} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Nom:</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name || ''} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Type de véhicule:</label>
              <input 
                type="text" 
                name="vehicle_type" 
                value={formData.vehicle_type || ''} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Immatriculation:</label>
                <input 
                  type="text" 
                  name="license_plate" 
                  value={formData.license_plate || ''} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Capacité:</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity || ''} 
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn">Enregistrer les modifications</button>
          </form>
        </div>
      ) : (
        <div className="profile-details">
          <div className="detail-section">
            <h3>Informations personnelles</h3>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{profile.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Prénom:</span>
              <span className="detail-value">{profile.first_name || 'Non renseigné'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nom:</span>
              <span className="detail-value">{profile.last_name || 'Non renseigné'}</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Véhicule et capacité</h3>
            <div className="detail-row">
              <span className="detail-label">Type de véhicule:</span>
              <span className="detail-value">{profile.vehicle_type || 'Non renseigné'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Immatriculation:</span>
              <span className="detail-value">{profile.license_plate || 'Non renseigné'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Capacité:</span>
              <span className="detail-value">{profile.capacity || 'Non renseigné'}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="course-history">
        <h2>Historique des courses</h2>
        {courseHistory.length > 0 ? (
          <table className="course-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Horaire</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {courseHistory.map((course) => (
                <tr key={course.id}>
                  <td>{new Date(course.date).toLocaleDateString()}</td>
                  <td>{course.client_name}</td>
                  <td>{course.departure_location}</td>
                  <td>{course.arrival_location}</td>
                  <td>{course.schedule}</td>
                  <td>{course.status || 'Disponible'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune course dans l'historique</p>
        )}
      </div>
    </div>
  );
}

export default Profile;