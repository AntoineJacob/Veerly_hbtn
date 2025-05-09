import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="bg-gray-800 text-white">
      {/* Main content */}
      <main>
        {/* Hero section - Uniformiser la couleur avec le reste */}
        <section className="flex flex-col md:flex-row py-12 md:py-20 px-6 md:px-12 bg-gray-800">
          <div className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-center md:text-left">
              Bienvenue sur<br />Veerly !
            </h1>
            <p className="text-lg text-center md:text-left max-w-md">
              La meilleure plateforme pour vous aider à gérer vos courses entre collaborateurs.
            </p>
            <div className="flex space-x-4 w-full md:w-auto pt-4">
              <Link to="/register" className="bg-green-100 text-gray-800 hover:bg-green-200 py-2 px-6 rounded-full transition-colors">
                Inscription
              </Link>
              <Link to="/login" className="bg-green-100 text-gray-800 hover:bg-green-200 py-2 px-6 rounded-full transition-colors">
                Connexion
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-1 w-full max-w-md overflow-hidden">
              <div className="w-full aspect-[3/4] bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="container mx-auto px-6 py-8">
          <div className="border-t border-gray-600 my-4"></div>
        </div>

        {/* Group section */}
        <section className="container mx-auto px-6 py-8 flex flex-col-reverse md:flex-row items-center">
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            <div className="bg-gray-700 rounded-lg p-1 w-full aspect-square overflow-hidden">
              <div className="w-full h-full bg-gray-600 rounded-lg"></div>
            </div>
          </div>
          <div className="w-full md:w-2/3 md:pl-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 text-center md:text-left">Créez vos propres groupes de collaborateurs</h2>
            <p className="text-gray-300 mb-2">
              Invitez vos collaborateurs dans un groupe privé afin de vous faciliter la répartition de vos courses
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="container mx-auto px-6 py-8">
          <div className="border-t border-gray-600 my-4"></div>
        </div>

        {/* Dashboard section */}
        <section className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 text-center md:text-left">Gérez vos courses</h2>
            <p className="text-gray-300">
             Dans les groupes, vous pouvez ajouter une nouvelle course, en récupérer une, voir les courses en cours ainsi que les courses terminées
            </p>
          </div>
          <div className="w-full md:w-1/3 mt-6 md:mt-0 md:pl-12">
            <div className="bg-gray-700 rounded-lg p-1 w-full aspect-square overflow-hidden">
              <div className="w-full h-full bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="container mx-auto px-6 py-8">
        </div>
      </main>
    </div>
  );
}

export default HomePage;