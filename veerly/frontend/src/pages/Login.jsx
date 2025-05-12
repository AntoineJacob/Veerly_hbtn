import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      sessionStorage.setItem('token', response.data.token);
      navigate('/courses');
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      setError(
        error.response?.data || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-dark transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;