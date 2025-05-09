import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Groups from './pages/Groups';
import GroupCourses from './pages/GroupCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-800">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/groups" element={<div className="container mx-auto px-4 py-6"><Groups /></div>} />
            <Route path="/courses/:groupId" element={<div className="container mx-auto px-4 py-6"><GroupCourses /></div>} />
            <Route path="/login" element={<div className="container mx-auto px-4 py-6 bg-white"><Login /></div>} />
            <Route path="/register" element={<div className="container mx-auto px-4 py-6 bg-white"><Register /></div>} />
            <Route path="/profile" element={<div className="container mx-auto px-4 py-6"><Profile /></div>} />
            <Route path="/courses" element={<Navigate replace to="/groups" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;