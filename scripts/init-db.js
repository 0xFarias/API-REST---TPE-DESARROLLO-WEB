// Crea la base de datos y la tabla "usuarios" automáticamente (npm run db:init)
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};
const DB_NAME = process.env.DB_NAME || 'api_usuarios';

async function main() {
  // 1. Crear la base de datos si no existe
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (existe.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Base de datos "${DB_NAME}" creada.`);
  } else {
    console.log(`La base de datos "${DB_NAME}" ya existe.`);
  }
  await admin.end();

  // 2. Crear la tabla usuarios
  const cliente = new Client({ ...config, database: DB_NAME });
  await cliente.connect();
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', '02_crear_tabla_usuarios.sql'), 'utf8');
  await cliente.query(sql);
  console.log('Tabla "usuarios" lista.');
  await cliente.end();
}

main().catch((error) => {
  console.error('Error al inicializar la base de datos:', error.message);
  process.exit(1);
});
