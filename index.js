const MongoLib = require('./lib/mongo');
const express = require('express');
const path = require('path');
const app = express();
const questionsApi = require('./routes/questions');

const PORT = process.env.PORT || 10000;

(async () => {
  try {
    const db = await new MongoLib().connect();

    // Middleware
    app.use(express.urlencoded({ extended: true }));
	app.use(express.json()); 

	questionsApi(app); 
    // Rutas
    questionsApi(app, db); // <-- pasar la conexión si la necesitas

    // Servir Angular
    const angularDistPath = path.join(__dirname, './dist/pasaletras/browser');
    app.use(express.static(angularDistPath));
    app.get(/^\/(?!api|questions).*/, (req, res) => {
      res.sendFile(path.join(angularDistPath, 'index.html'));
    });

    // Escuchar
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en ${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar la app:', err.message);
  }
})();
