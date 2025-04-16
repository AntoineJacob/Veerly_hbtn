const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt-config.cjs');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('En-tête Authorization reçu:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('Accès refusé : Aucun token fourni');
  }

  try {
    // Afficher un aperçu sécurisé de la clé pour le débogage
    console.log('Clé secrète utilisée pour la vérification:', jwtConfig.secretKey.substring(0, 5) + '***');
    
    const decoded = jwt.verify(token, jwtConfig.secretKey);
    console.log('Token vérifié avec succès:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur lors de la vérification du token:', err.message);
    return res.status(403).send('Accès refusé : Token invalide');
  }
}

module.exports = { authenticateToken };