import React from 'react';

function GroupCard({ group, onViewCourses, onInvite, onDelete, isAdmin }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      <h3 className="font-bold text-lg mb-2">{group.group_name}</h3>
      <p className="text-gray-600 mb-4">{group.collaborators || "Aucune description"}</p>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => onViewCourses(group.id)} 
          className="flex-1 bg-secondary text-white py-1.5 px-3 rounded text-sm hover:bg-secondary-dark transition-colors"
        >
          Voir les courses
        </button>
        
        {isAdmin && (
          <>
            <button 
              onClick={() => onInvite(group)} 
              className="flex-1 bg-primary text-white py-1.5 px-3 rounded text-sm hover:bg-primary-dark transition-colors"
            >
              Inviter
            </button>
            <button 
              onClick={() => onDelete(group.id)} 
              className="flex-1 bg-danger text-white py-1.5 px-3 rounded text-sm hover:bg-danger-dark transition-colors"
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GroupCard;