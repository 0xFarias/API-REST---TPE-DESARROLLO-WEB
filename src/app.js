// Configuración de la aplicación Express
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios.routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejoErrores');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de bienvenida con la lista de endpoints
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API REST de usuarios - Node.js + Express + PostgreSQL',
    endpoints: {
      'POST /usuarios': 'Registrar un usuario',
      'GET /usuarios': 'Consultar todos los usuarios',
      'GET /usuarios/:id': 'Consultar un usuario por ID',
      'PUT /usuarios/:id': 'Actualizar un usuario',
      'DELETE /usuarios/:id': 'Eliminar un usuario',
    },
  });
});

// Rutas de la API
app.use('/usuarios', usuariosRoutes);

// Rutas inexistentes y errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
