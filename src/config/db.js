// Conexión a PostgreSQL usando un pool de conexiones (paquete "pg")
const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'api_usuarios',
});

// Evita que el servidor se caiga si PostgreSQL cierra una conexión inactiva
pool.on('error', (error) => {
  console.error('Conexión con PostgreSQL perdida:', error.message);
});

// Comprueba la conexión al iniciar el servidor
async function probarConexion() {
  const { rows } = await pool.query('SELECT current_database() AS bd, version() AS version');
  return rows[0];
}

module.exports = { pool, probarConexion };
