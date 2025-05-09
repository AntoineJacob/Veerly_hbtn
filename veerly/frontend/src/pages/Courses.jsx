import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Courses() {
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
    additional_notes: '',
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est connecté et charger les courses
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    fetchCourses();
  }, [navigate]);

  // Récupérer les courses depuis l'API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/courses/get-courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Soumettre le formulaire pour ajouter une course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/courses/add-course', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert('Course ajoutée avec succès');
      
      // Réinitialiser le formulaire
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
        additional_notes: '',
      });
      
      // Rafraîchir la liste des courses
      fetchCourses();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la course:', error);
      alert('Une erreur est survenue lors de l\'ajout de la course');
    }
  };

  // Fonction pour supprimer une course
  const handleDelete = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/delete-course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert('Course supprimée avec succès');
      
      // Rafraîchir la liste des courses
      fetchCourses();
    } catch (error) {
      console.error('Erreur lors de la suppression de la course:', error);
      alert('Une erreur est survenue lors de la suppression de la course');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des courses</h1>
      
      {/* Formulaire d'ajout de course */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle course</h2>
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
      
      {/* Tableau des courses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Courses disponibles</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.client_name}</div>
                      <div className="text-sm text-gray-500">{course.client_number}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.departure_location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.arrival_location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.schedule}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900 mr-2 font-medium"
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
          <p className="text-center py-8 text-gray-500 italic">Aucune course disponible</p>
        )}
      </div>
    </div>
  );
}

export default Courses;