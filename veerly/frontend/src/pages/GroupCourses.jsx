import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DriversList from '../components/DriversList';
import CourseCard from '../components/CourseCard';
import ReservationReceipt from '../components/ReservationReceipt';

function GroupCourses() {
  const [courses, setCourses] = useState([]);
  const [coursesByStatus, setCoursesByStatus] = useState({
    available: [],
    assigned: [],
    in_progress: [],
    completed: []
  });
  const [formData, setFormData] = useState({
    client_name: '',
    client_number: '',
    date: '',
    departure_location: '',
    arrival_location: '',
    schedule: '',
    vehicle_type: '',
    number_of_people: '',
    number_of_bags: '',
    bag_type: '',
    additional_notes: ''
  });
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const { groupId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    fetchGroupInfo();
    fetchGroupCourses();
    fetchGroupCoursesByStatus();
  }, [groupId, navigate]);

  const fetchGroupInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/groups/get-group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGroupInfo(response.data);
      
      const userInfo = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(response.data.user_id === userInfo.id);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du groupe:', error);
      setError('Impossible de charger les informations du groupe');
      
      if (error.response && error.response.status === 404) {
        alert('Ce groupe n\'existe pas ou vous n\'y avez pas accès');
        navigate('/groups');
      }
    }
  };

  const fetchGroupCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/courses/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses du groupe:', error);
      setError('Impossible de charger les courses du groupe');
      setLoading(false);
      
      if (error.response && error.response.status === 403) {
        alert('Vous n\'avez pas accès à ce groupe');
        navigate('/groups');
      }
    }
  };

  const fetchGroupCoursesByStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/courses/group/${groupId}/by-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCoursesByStatus(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses par statut:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/group/${groupId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Course ajoutée avec succès au groupe');
      
      setFormData({
        client_name: '',
        client_number: '',
        date: '',
        departure_location: '',
        arrival_location: '',
        schedule: '',
        vehicle_type: '',
        number_of_people: '',
        number_of_bags: '',
        bag_type: '',
        additional_notes: ''
      });
      
      fetchGroupCourses();
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la course au groupe:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de l\'ajout de la course');
      }
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/group/${groupId}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Course supprimée avec succès');
      fetchGroupCourses();
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors de la suppression de la course:', error);
      if (error.response) {
        alert(`Erreur: ${error.response.data}`);
      } else {
        alert('Une erreur est survenue lors de la suppression de la course');
      }
    }
  };

  const handleAssignCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${courseId}/assign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors de la prise en charge de la course:', error);
      alert('Erreur lors de la prise en charge de la course');
    }
  };

  const handleUnassignCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${courseId}/unassign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la prise en charge:', error);
      alert('Erreur lors de l\'annulation de la prise en charge');
    }
  };

  const handleStartCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${courseId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors du démarrage de la course:', error);
      alert('Erreur lors du démarrage de la course');
    }
  };

  const handleCompleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${courseId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchGroupCoursesByStatus();
    } catch (error) {
      console.error('Erreur lors de la finalisation de la course:', error);
      alert('Erreur lors de la finalisation de la course');
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const userIsChauffeur = () => {
    return true;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Chargement des courses du groupe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center text-sm"
          onClick={() => navigate('/groups')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux groupes
        </button>
        <h1 className="text-2xl font-bold text-white">
          Courses du groupe: {groupInfo ? groupInfo.group_name : '...'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle course au groupe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client:
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro du client:
              </label>
              <input
                type="text"
                name="client_number"
                value={formData.client_number}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date:
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horaire:
              </label>
              <input
                type="time"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de véhicule:
              </label>
              <input
                type="text"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de départ:
              </label>
              <input
                type="text"
                name="departure_location"
                value={formData.departure_location}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu d'arrivée:
              </label>
              <input
                type="text"
                name="arrival_location"
                value={formData.arrival_location}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de personnes:
              </label>
              <input
                type="number"
                name="number_of_people"
                value={formData.number_of_people}
                onChange={handleChange}
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de bagages:
              </label>
              <input
                type="number"
                name="number_of_bags"
                value={formData.number_of_bags}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de bagages:
              </label>
              <input
                type="text"
                name="bag_type"
                value={formData.bag_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes supplémentaires:
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-24"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="bg-primary text-white py-2 px-6 rounded hover:bg-primary-dark transition-colors"
          >
            Ajouter une course
          </button>
        </form>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'available' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('available')}
        >
          Disponibles ({coursesByStatus.available?.length || 0})
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'assigned' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('assigned')}
        >
          Prises en charge ({coursesByStatus.assigned?.length || 0})
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'in_progress' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('in_progress')}
        >
          En cours ({coursesByStatus.in_progress?.length || 0})
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'completed' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('completed')}
        >
          Terminées ({coursesByStatus.completed?.length || 0})
        </button>
        
        {isAdmin && (
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'drivers' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('drivers')}
          >
            Chauffeurs
          </button>
        )}
      </div>
      
      {activeTab === 'available' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Courses disponibles</h2>
          {coursesByStatus.available?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByStatus.available.map(course => (
                <CourseCard 
                  key={course.id}
                  course={course}
                  onAssign={handleAssignCourse}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                  userIsChauffeur={userIsChauffeur()}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
              Aucune course disponible
            </p>
          )}
        </div>
      )}
      
      {activeTab === 'assigned' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Courses prises en charge</h2>
          {coursesByStatus.assigned?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByStatus.assigned.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                    <h3 className="font-bold text-lg">{course.client_name}</h3>
                    <span className="text-gray-600 text-sm">{formatDate(course.date)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="font-medium">Départ:</span> {course.departure_location}</p>
                    <p className="text-sm"><span className="font-medium">Arrivée:</span> {course.arrival_location}</p>
                    <p className="text-sm"><span className="font-medium">Horaire:</span> {course.schedule}</p>
                    <p className="text-sm"><span className="font-medium">Véhicule:</span> {course.vehicle_type}</p>
                    <p className="text-sm"><span className="font-medium">Personnes:</span> {course.number_of_people}</p>
                    <p className="text-sm"><span className="font-medium">Bagages:</span> {course.number_of_bags} {course.bag_type && `(${course.bag_type})`}</p>
                    {course.additional_notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {course.additional_notes}
                      </p>
                    )}
                  </div>
                  
                  {/* Information du chauffeur */}
                  {course.driver_first_name && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Chauffeur:</span> {course.driver_first_name} {course.driver_last_name}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleStartCourse(course.id)} 
                      className="flex-1 bg-secondary text-white py-1.5 px-3 rounded text-sm hover:bg-secondary-dark transition-colors"
                    >
                      Démarrer
                    </button>
                    <button 
                      onClick={() => handleUnassignCourse(course.id)} 
                      className="flex-1 bg-danger text-white py-1.5 px-3 rounded text-sm hover:bg-danger-dark transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
              Aucune course prise en charge
            </p>
          )}
        </div>
      )}
      
      {activeTab === 'in_progress' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Courses en cours</h2>
          {coursesByStatus.in_progress?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByStatus.in_progress.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                    <h3 className="font-bold text-lg">{course.client_name}</h3>
                    <span className="text-gray-600 text-sm">{formatDate(course.date)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="font-medium">Départ:</span> {course.departure_location}</p>
                    <p className="text-sm"><span className="font-medium">Arrivée:</span> {course.arrival_location}</p>
                    <p className="text-sm"><span className="font-medium">Horaire:</span> {course.schedule}</p>
                    <p className="text-sm"><span className="font-medium">Véhicule:</span> {course.vehicle_type}</p>
                    <p className="text-sm"><span className="font-medium">Personnes:</span> {course.number_of_people}</p>
                    <p className="text-sm"><span className="font-medium">Bagages:</span> {course.number_of_bags} {course.bag_type && `(${course.bag_type})`}</p>
                    {course.additional_notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {course.additional_notes}
                      </p>
                    )}
                    {course.start_time && (
                      <p className="text-sm">
                        <span className="font-medium">Démarré à:</span> {new Date(course.start_time).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  
                  {/* Information du chauffeur */}
                  {course.driver_first_name && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Chauffeur:</span> {course.driver_first_name} {course.driver_last_name}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleCompleteCourse(course.id)} 
                      className="flex-1 bg-warning text-white py-1.5 px-3 rounded text-sm hover:bg-warning-dark transition-colors"
                    >
                      Terminer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
              Aucune course en cours
            </p>
          )}
        </div>
      )}
      
      {activeTab === 'completed' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Courses terminées</h2>
          {coursesByStatus.completed?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByStatus.completed.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 opacity-80">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                    <h3 className="font-bold text-lg">{course.client_name}</h3>
                    <span className="text-gray-600 text-sm">{formatDate(course.date)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="font-medium">Départ:</span> {course.departure_location}</p>
                    <p className="text-sm"><span className="font-medium">Arrivée:</span> {course.arrival_location}</p>
                    <p className="text-sm"><span className="font-medium">Horaire:</span> {course.schedule}</p>
                    <p className="text-sm"><span className="font-medium">Véhicule:</span> {course.vehicle_type}</p>
                    <p className="text-sm"><span className="font-medium">Personnes:</span> {course.number_of_people}</p>
                    <p className="text-sm"><span className="font-medium">Bagages:</span> {course.number_of_bags} {course.bag_type && `(${course.bag_type})`}</p>
                    {course.additional_notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {course.additional_notes}
                      </p>
                    )}
                    {course.start_time && (
                      <p className="text-sm">
                        <span className="font-medium">Démarré à:</span> {new Date(course.start_time).toLocaleTimeString()}
                      </p>
                    )}
                    {course.end_time && (
                      <p className="text-sm">
                        <span className="font-medium">Terminé à:</span> {new Date(course.end_time).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  
                  {/* Information du chauffeur */}
                  {course.driver_first_name && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Complétée par:</span> {course.driver_first_name} {course.driver_last_name}
                      </p>
                    </div>
                  )}

                  {/* Ajouter ce bouton "Bon de réservation" */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <button 
                      onClick={() => handleViewReceipt(course.id)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
                    >
                      <svg className="h-5 w-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Bon de réservation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
              Aucune course terminée
            </p>
          )}
        </div>
      )}

      {activeTab === 'drivers' && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Liste des chauffeurs</h2>
          <DriversList />
        </div>
      )}

      {showReceipt && receiptData && (
        <ReservationReceipt 
          receipt={receiptData}
          onClose={() => setShowReceipt(false)}
          onSendEmail={handleSendReceiptEmail}
        />
      )}
    </div>
  );
}

export default GroupCourses;