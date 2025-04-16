import React from 'react';

function CourseCard({ course }) {
  return (
    <div className="course-card">
      <h3>{course.client_name}</h3>
      <p><strong>Date :</strong> {course.date}</p>
      <p><strong>Départ :</strong> {course.departure_location}</p>
      <p><strong>Arrivée :</strong> {course.arrival_location}</p>
      <p><strong>Véhicule :</strong> {course.vehicle_type}</p>
    </div>
  );
}

export default CourseCard;