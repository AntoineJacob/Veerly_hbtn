import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Courses.css';

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
      const token = localStorage.getItem('token');
      console.log('Token récupéré du localStorage:', token ? 'Token présent' : 'Token absent');
      
      const response = await axios.get('/api/courses/get-courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Courses récupérées:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      if (error.response && error.response.status === 403) {
        console.error('Détails de l\'erreur 403:', error.response.data);
      }
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
    // Demander confirmation avant de supprimer
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
    <div className="container">
      <h1>Gestion des courses</h1>
      
      {/* Bouton de débogage pour se déconnecter */}
      <button onClick={() => {
        localStorage.removeItem('token');
        alert('Déconnecté avec succès! Redirection vers la page de connexion...');
        navigate('/login');
      }}>
        Se déconnecter (Debug)
      </button>
      
      {/* Formulaire d'ajout de course */}
      <div className="form-container">
        <h2>Ajouter une nouvelle course</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du client:</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Numéro du client:</label>
            <input
              type="text"
              name="client_number"
              value={formData.client_number}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Lieu de départ:</label>
            <input
              type="text"
              name="departure_location"
              value={formData.departure_location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Lieu d'arrivée:</label>
            <input
              type="text"
              name="arrival_location"
              value={formData.arrival_location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Horaire:</label>
            <input
              type="time"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Type de véhicule:</label>
            <input
              type="text"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nombre de personnes:</label>
            <input
              type="number"
              name="number_of_people"
              value={formData.number_of_people}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nombre de bagages:</label>
            <input
              type="number"
              name="number_of_bags"
              value={formData.number_of_bags}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Type de bagages:</label>
            <input
              type="text"
              name="bag_type"
              value={formData.bag_type}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Notes supplémentaires:</label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <button type="submit">Ajouter une course</button>
        </form>
      </div>
      
      {/* Tableau des courses */}
      <div className="table-container">
        <h2>Courses disponibles</h2>
        {courses.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Numéro</th>
                <th>Date</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Horaire</th>
                <th>Véhicule</th>
                <th>Personnes</th>
                <th>Bagages</th>
                <th>Type de bagages</th>
                <th>Notes</th>
                <th>Actions</th> {/* Nouvelle colonne pour les actions */}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.client_name}</td>
                  <td>{course.client_number}</td>
                  <td>{new Date(course.date).toLocaleDateString()}</td>
                  <td>{course.departure_location}</td>
                  <td>{course.arrival_location}</td>
                  <td>{course.schedule}</td>
                  <td>{course.vehicle_type}</td>
                  <td>{course.number_of_people}</td>
                  <td>{course.number_of_bags}</td>
                  <td>{course.bag_type}</td>
                  <td>{course.additional_notes}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="delete-btn"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune course disponible</p>
        )}
      </div>
    </div>
  );
}

export default Courses;