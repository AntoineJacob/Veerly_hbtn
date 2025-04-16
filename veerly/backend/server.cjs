require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'Veerly_db',
  charset: 'utf8mb4',
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Verifier que les variables d'environnement sont bien chargées
console.log('JWT_SECRET from .env:', process.env.JWT_SECRET ? 'Définie' : 'Non définie');
console.log('JWT_SECRET preview:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '***' : 'Non définie');

// Routes
const authRoutes = require('./routes/auth.cjs');
const courseRoutes = require('./routes/courses.cjs');
const groupRoutes = require('./routes/groups.cjs');
const profileRoutes = require('./routes/profile.cjs');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/profile', profileRoutes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
