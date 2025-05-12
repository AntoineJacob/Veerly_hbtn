import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useParams();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`/api/courses/group/${groupId}/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDrivers(response.data.drivers);
      setStats(response.data.stats || {});
      setLoading(false);
    } catch (error) {
      setError('Impossible de charger la liste des chauffeurs');
      setLoading(false);
      
      if (error.response && error.response.status === 403) {
        setError('Vous n\'êtes pas autorisé à voir la liste des chauffeurs');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Chargement des chauffeurs...</div>;
  }

  if (error) {
    return <div className="text-center py-4 px-3 bg-red-50 text-red-600 rounded-md">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[150px] bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-sm text-gray-500 mb-2">Courses totales</div>
          <div className="text-2xl font-semibold">
            {Object.values(stats).reduce((sum, val) => sum + val, 0) || 0}
          </div>
        </div>
        <div className="flex-1 min-w-[150px] bg-white rounded-lg p-4 shadow-sm text-center border-l-4 border-gray-400">
          <div className="text-sm text-gray-500 mb-2">Disponibles</div>
          <div className="text-2xl font-semibold">{stats['Disponible'] || 0}</div>
        </div>
        <div className="flex-1 min-w-[150px] bg-white rounded-lg p-4 shadow-sm text-center border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500 mb-2">Prises en charge</div>
          <div className="text-2xl font-semibold">{stats['Prise en charge'] || 0}</div>
        </div>
        <div className="flex-1 min-w-[150px] bg-white rounded-lg p-4 shadow-sm text-center border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 mb-2">En cours</div>
          <div className="text-2xl font-semibold">{stats['En cours'] || 0}</div>
        </div>
        <div className="flex-1 min-w-[150px] bg-white rounded-lg p-4 shadow-sm text-center border-l-4 border-green-500">
          <div className="text-sm text-gray-500 mb-2">Terminées</div>
          <div className="text-2xl font-semibold">{stats['Terminée'] || 0}</div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Liste des chauffeurs du groupe</h2>
      
      {drivers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses terminées</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses en cours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses assignées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.first_name} {driver.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.completed_rides}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.active_rides}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.assigned_rides}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">Aucun chauffeur n'est membre de ce groupe</p>
      )}
    </div>
  );
}

export default DriversList;