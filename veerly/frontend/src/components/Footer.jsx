import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white border-t border-gray-700 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2">Veerly</h3>
            <p className="text-gray-300">
              Plateforme de gestion de courses pour chauffeurs et groupes.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Liens</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-gray-300 hover:text-white hover:underline">Courses</Link></li>
              <li><Link to="/groups" className="text-gray-300 hover:text-white hover:underline">Groupes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-gray-300">support@veerly.com</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-300">&copy; {currentYear} Veerly. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;