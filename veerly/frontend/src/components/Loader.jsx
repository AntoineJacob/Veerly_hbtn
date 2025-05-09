import React from 'react';

function Loader() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-3 text-gray-600">Chargement...</p>
    </div>
  );
}

export default Loader;