import React from 'react';

function CourseCard({ course, onAssign, onStart, onComplete, onDelete, isAdmin, userIsChauffeur }) {
  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-primary">
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
      
      <div className="flex flex-wrap gap-2">
        {course.status === 'Disponible' && userIsChauffeur && (
          <button 
            onClick={() => onAssign(course.id)} 
            className="flex-1 bg-primary text-white py-1.5 px-3 rounded text-sm hover:bg-primary-dark transition-colors"
          >
            Prendre en charge
          </button>
        )}
        
        {course.status === 'Prise en charge' && course.user_id === parseInt(localStorage.getItem('userId')) && (
          <button 
            onClick={() => onStart(course.id)} 
            className="flex-1 bg-secondary text-white py-1.5 px-3 rounded text-sm hover:bg-secondary-dark transition-colors"
          >
            Démarrer
          </button>
        )}
        
        {course.status === 'En cours' && course.user_id === parseInt(localStorage.getItem('userId')) && (
          <button 
            onClick={() => onComplete(course.id)} 
            className="flex-1 bg-warning text-white py-1.5 px-3 rounded text-sm hover:bg-warning-dark transition-colors"
          >
            Terminer
          </button>
        )}
        
        {(isAdmin || (course.status === 'Prise en charge' && course.user_id === parseInt(localStorage.getItem('userId')))) && (
          <button 
            onClick={() => onDelete(course.id)} 
            className="flex-1 bg-danger text-white py-1.5 px-3 rounded text-sm hover:bg-danger-dark transition-colors"
          >
            {course.status === 'Disponible' || isAdmin ? 'Supprimer' : 'Annuler'}
          </button>
        )}
      </div>
    </div>
  );
}

export default CourseCard;