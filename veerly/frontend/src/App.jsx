import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Groups from './pages/Groups';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import './styles.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Bienvenue sur Veerly</h1>} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
