// Punto de entrada: levanta el servidor
require('dotenv').config({ quiet: true });
const app = require('./app');
const { probarConexion } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  try {
    const info = await probarConexion();
    console.log(`Conectado a PostgreSQL - base de datos: ${info.bd}`);
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    console.error('Revise los datos del archivo .env y que el servicio de PostgreSQL esté activo.');
  }
});
