import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReservationReceipt from '../components/ReservationReceipt';

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
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
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

  const handleViewReceipt = async (courseId) => {
    try {
      setReceiptLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/courses/${courseId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReceiptData(response.data);
      setShowReceipt(true);
      setReceiptLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération du bon de réservation:', error);
      alert('Impossible de récupérer le bon de réservation');
      setReceiptLoading(false);
    }
  };

  const handleSendReceiptEmail = async (updatedReceipt) => {
    if (!updatedReceipt) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${updatedReceipt.id}/send-receipt`, {
        price: updatedReceipt.price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Le bon de réservation a été envoyé par email');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du bon de réservation:', error);
      alert('Erreur lors de l\'envoi du bon de réservation par email');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Mon Profil</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-semibold">{profile.first_name || ''} {profile.last_name || ''}</h2>
          <p className="text-gray-600">{profile.email}</p>
          <p className="text-sm text-gray-500">Membre depuis: {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${editMode 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
              : 'bg-primary hover:bg-primary-dark text-white'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Annuler' : 'Modifier le profil'}
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${showPasswordForm 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
              : 'bg-secondary hover:bg-secondary-dark text-white'}`}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>
      
      {showPasswordForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel:
              </label>
              <input 
                type="password" 
                name="currentPassword" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe:
              </label>
              <input 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe:
              </label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Changer le mot de passe
            </button>
          </form>
        </div>
      ) : editMode ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Modifier vos informations</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom:
                </label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom:
                </label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de véhicule:
              </label>
              <input 
                type="text" 
                name="vehicle_type" 
                value={formData.vehicle_type || ''} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Immatriculation:
                </label>
                <input 
                  type="text" 
                  name="license_plate" 
                  value={formData.license_plate || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité:
                </label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity || ''} 
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Informations personnelles</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-800">{profile.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Prénom:</span>
                <span className="text-gray-800">{profile.first_name || 'Non renseigné'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Nom:</span>
                <span className="text-gray-800">{profile.last_name || 'Non renseigné'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Véhicule et capacité</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Type de véhicule:</span>
                <span className="text-gray-800">{profile.vehicle_type || 'Non renseigné'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Immatriculation:</span>
                <span className="text-gray-800">{profile.license_plate || 'Non renseigné'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Capacité:</span>
                <span className="text-gray-800">{profile.capacity || 'Non renseigné'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Historique des courses terminées</h2>
        {courseHistory.length > 0 ? (
          <>
            <div className="overflow-x-auto hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseHistory.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(course.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.departure_location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.arrival_location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.schedule}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={() => handleViewReceipt(course.id)}
                          className="text-secondary hover:text-secondary-dark font-medium flex items-center justify-end ml-auto"
                        >
                          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Bon
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Version alternative pour les petits écrans */}
            <div className="block sm:hidden">
              {courseHistory.map((course) => (
                <div key={course.id} className="bg-white rounded-md shadow-sm p-4 mb-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{course.client_name}</p>
                      <p className="text-sm text-gray-600">{new Date(course.date).toLocaleDateString()} - {course.schedule}</p>
                    </div>
                    <button 
                      onClick={() => handleViewReceipt(course.id)}
                      className="flex items-center text-secondary hover:text-secondary-dark"
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Bon
                    </button>
                  </div>
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Départ:</span> {course.departure_location}</p>
                    <p><span className="font-medium">Arrivée:</span> {course.arrival_location}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 italic text-center py-4">Aucune course terminée dans l'historique</p>
        )}
      </div>

      {showReceipt && receiptData && (
        <ReservationReceipt 
          receipt={receiptData}
          onClose={() => setShowReceipt(false)}
          onSendEmail={handleSendReceiptEmail}
        />
      )}

      {receiptLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <p>Chargement du bon de réservation...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;