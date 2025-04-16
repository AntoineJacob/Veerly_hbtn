import React from 'react';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={onClose}>Fermer</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;