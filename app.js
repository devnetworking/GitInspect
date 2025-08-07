require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const { inspectRepository } = require('./controllers/repoController');
const { applySecurity } = require('./middlewares/security');
applySecurity(app);


// Configuration de base
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes simplifiées et corrigées
app.get('/', (req, res) => res.render('index'));

// Nouvelle version plus stable de la route
app.get('/inspect/:owner/:repo', inspectRepository);
// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erreur serveur');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});