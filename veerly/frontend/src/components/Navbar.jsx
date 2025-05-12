import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">Veerly</Link>
        
        <button 
          className="md:hidden flex flex-col justify-center items-center w-10 h-10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white my-1 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        
        <nav className={`absolute md:relative top-full left-0 w-full md:w-auto bg-gray-800 md:bg-transparent shadow-md md:shadow-none z-40 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <ul className="flex flex-col md:flex-row md:space-x-6 p-4 md:p-0">
            {isLoggedIn ? (
              <>
                <li>
                  <Link 
                    to="/groups" 
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/groups' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Groupes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profil
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }} 
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-gray-700 hover:text-red-200 transition-colors"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/login' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-gray-800 hover:bg-green-200 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;