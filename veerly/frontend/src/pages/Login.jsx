import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      console.log('Token reçu du serveur:', response.data.token);
      localStorage.setItem('token', response.data.token); // Stockez le token
      alert('Connexion réussie');
      navigate('/courses');
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      alert('Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}

export default Login;