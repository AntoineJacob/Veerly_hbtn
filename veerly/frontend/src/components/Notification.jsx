import React from 'react';

function Notification({ message, type }) {
  const getNotificationClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };
  
  return (
    <div className={`border p-4 rounded-md ${getNotificationClasses()}`}>
      <p>{message}</p>
    </div>
  );
}

export default Notification;