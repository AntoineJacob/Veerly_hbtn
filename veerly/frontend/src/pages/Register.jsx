import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    vehicle_type: '',
    license_plate: '',
    capacity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', formData);
      console.log('Utilisateur inscrit:', response.data);
      alert('Inscription réussie');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <form onSubmit={handleRegister}>
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
      <input
        type="text"
        name="first_name"
        placeholder="Prénom"
        value={formData.first_name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="last_name"
        placeholder="Nom"
        value={formData.last_name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="vehicle_type"
        placeholder="Type de véhicule"
        value={formData.vehicle_type}
        onChange={handleChange}
      />
      <input
        type="text"
        name="license_plate"
        placeholder="Plaque d'immatriculation"
        value={formData.license_plate}
        onChange={handleChange}
      />
      <input
        type="number"
        name="capacity"
        placeholder="Capacité"
        value={formData.capacity}
        onChange={handleChange}
      />
      <button type="submit">S'inscrire</button>
    </form>
  );
}

export default Register;