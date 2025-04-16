import React from 'react';

function GroupCard({ group }) {
  return (
    <div className="group-card">
      <h3>{group.group_name}</h3>
      <p>{group.description}</p>
    </div>
  );
}

export default GroupCard;