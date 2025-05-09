import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

function ReservationReceipt({ receipt, onClose, onSendEmail }) {
  const receiptRef = useRef();
  // Initialiser le prix avec la valeur existante ou une chaîne vide
  const [price, setPrice] = useState(receipt.price || '');
  const [isEditingPrice, setIsEditingPrice] = useState(!receipt.price); // Mettre en mode édition si pas de prix

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const handlePriceChange = (e) => {
    // Accepter uniquement des nombres positifs avec une virgule ou un point décimal
    // Remplacer le point par une virgule pour le format français
    const value = e.target.value
      .replace(/[^0-9.,]/g, '') // Autorise uniquement chiffres, virgule et point
      .replace(/\./, ','); // Remplace point par virgule
    
    // S'assurer qu'il n'y a qu'une seule virgule
    const parts = value.split(',');
    if (parts.length > 2) {
      return; // Ne pas mettre à jour si plus d'une virgule
    }
    
    // Limiter les décimales à 2 chiffres
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    setPrice(value);
  };

  const formatPriceForDisplay = (priceValue) => {
    // S'assurer que la virgule est présente pour l'affichage
    if (priceValue.includes(',')) {
      const [whole, decimal] = priceValue.split(',');
      // Ajouter des zéros si nécessaire pour avoir 2 décimales
      return `${whole},${decimal.padEnd(2, '0')}`;
    } else {
      // Si pas de décimale, ajouter ",00"
      return `${priceValue},00`;
    }
  };

  const handleSendEmail = () => {
    if (!price || price.trim() === '') {
      alert('Veuillez définir un prix avant d\'envoyer le bon de réservation');
      return;
    }
    onSendEmail({ ...receipt, price });
  };

  // Vérifier si le bouton d'impression et d'email devrait être désactivé
  const isPriceValid = price && price.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold">Bon de réservation</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Edition du prix et boutons d'action */}
        <div className="px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center mb-2 sm:mb-0 mr-auto">
            <label htmlFor="price" className="font-medium mr-2">Tarif (€):</label>
            {isEditingPrice ? (
              <div className="flex items-center">
                <input
                  type="text"
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="00,00"
                  className="w-24 p-1 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  autoFocus
                />
                <button 
                  onClick={() => setIsEditingPrice(false)}
                  className="ml-2 text-primary hover:text-primary-dark"
                  disabled={!isPriceValid}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="font-semibold text-lg">{formatPriceForDisplay(price)} €</span>
                <button 
                  onClick={() => setIsEditingPrice(true)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={handlePrint}
            disabled={!isPriceValid}
            className={`flex items-center px-4 py-2 bg-primary text-white rounded transition-colors ${
              isPriceValid ? 'hover:bg-primary-dark' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
          <button 
            onClick={handleSendEmail}
            disabled={!isPriceValid}
            className={`flex items-center px-4 py-2 bg-secondary text-white rounded transition-colors ${
              isPriceValid ? 'hover:bg-secondary-dark' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer par email
          </button>
        </div>

        {!isPriceValid && (
          <div className="px-6 mb-2">
            <p className="text-warning-dark text-sm">Veuillez définir un prix avant d'imprimer ou d'envoyer le bon de réservation.</p>
          </div>
        )}
        
        {/* Receipt content */}
        <div className="p-6" ref={receiptRef}>
          <div className="border-b border-gray-200 pb-4 mb-6">
            
            <h1 className="font-bold text-xl uppercase">SERVICE DE VOITURE DE TRANSPORT AVEC CHAUFFEUR</h1>
            
            <div className="mt-4">
              <p className="font-medium">BILLET COLLECTIF</p>
              <p className="text-gray-600">(Arrêté du 14 Février 1986 - Article 5)</p>
              <p className="text-gray-600">et</p>
              <p className="font-medium">ORDRE DE MISSION</p>
              <p className="text-gray-600">(Arrêté du 6 Janvier 1993 - Article 3)</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="font-bold text-lg">Veerly</h2>
            <p className="text-gray-600">Location de véhicule avec chauffeur</p>
            {receipt.group_name && (
              <p className="mt-2">{receipt.group_name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="mb-2">
                <span className="font-medium">Conducteur :</span> {receipt.driver_first_name} {receipt.driver_last_name}
              </p>
              <p>
                <span className="font-medium">Passager :</span> {receipt.client_name} {receipt.client_number}
              </p>
            </div>
            
            <div>
              <p className="mb-2">
                <span className="font-medium">Commande :</span> {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="mb-2">
                <span className="font-medium">Prise en charge :</span> {new Date(receipt.date).toLocaleDateString('fr-FR')} {receipt.schedule}
              </p>
              <p className="mb-2 flex items-start">
                <svg className="h-5 w-5 mr-1 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  <span className="font-medium">Lieu prise en charge :</span> {receipt.departure_location}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-medium">Destination :</span> {receipt.arrival_location}
              </p>
              <p className="font-medium print:text-black">
                Tarif : <span className="text-xl">{formatPriceForDisplay(price)} €</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 text-center">
            <div className="py-4">
              <div className="flex justify-center mb-2">
                <svg className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
              </div>
              <p className="text-sm">Véhicule: {receipt.vehicle_type}</p>
            </div>
            <div className="py-4">
              <div className="flex justify-center mb-2">
                <svg className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p className="text-sm">Personnes: {receipt.number_of_people}</p>
            </div>
            <div className="py-4">
              <div className="flex justify-center mb-2">
                <svg className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <p className="text-sm">Réservation #{receipt.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationReceipt;