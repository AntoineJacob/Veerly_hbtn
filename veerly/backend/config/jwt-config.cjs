require('dotenv').config();

const jwtConfig = {
  secretKey: process.env.JWT_SECRET
};

console.log('Configuration JWT chargée, clé secrète: ' + jwtConfig.secretKey.substring(0, 5) + '***');

module.exports = jwtConfig;