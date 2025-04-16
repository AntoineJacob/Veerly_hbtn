import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Si vous avez une fonction de redirection, utilisez-la ici
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">Veerly</span>
          </Link>
        </div>

        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </button>

        <nav className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <ul>
            <li className={location.pathname === '/courses' ? 'active' : ''}>
              <Link to="/courses">Courses</Link>
            </li>
            <li className={location.pathname === '/groups' ? 'active' : ''}>
              <Link to="/groups">Groupes</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className={location.pathname === '/profile' ? 'active' : ''}>
                  <Link to="/profile">Profil</Link>
                </li>
                <li className="logout-item">
                  <button onClick={handleLogout} className="logout-btn">
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className={location.pathname === '/login' ? 'active' : ''}>
                  <Link to="/login">Connexion</Link>
                </li>
                <li className={location.pathname === '/register' ? 'active' : ''}>
                  <Link to="/register" className="register-btn">Inscription</Link>
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