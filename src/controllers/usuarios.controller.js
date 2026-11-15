// Controlador de usuarios: lógica de cada operación CRUD
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Columnas que se devuelven al cliente (la contraseña nunca se devuelve)
const COLUMNAS = 'id, nombre, correo, edad, telefono, fecha_registro, fecha_actualizacion';

// POST /usuarios -> Registrar
async function registrarUsuario(req, res, next) {
  try {
    const { nombre, correo, contrasena, edad, telefono } = req.body;
    const hash = await bcrypt.hash(contrasena, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, edad, telefono)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNAS}`,
      [nombre.trim(), correo.trim().toLowerCase(), hash, Number(edad), String(telefono).trim()]
    );

    res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente.', data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// GET /usuarios -> Consultar todos
async function listarUsuarios(req, res, next) {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id`);
    res.status(200).json({ ok: true, total: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// GET /usuarios/:id -> Consultar por ID
async function obtenerUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM usuarios WHERE id = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con id ${id}.` });
    }
    res.status(200).json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// PUT /usuarios/:id -> Actualizar (uno o varios campos)
async function actualizarUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nombre, correo, contrasena, edad, telefono } = req.body;

    // Solo se actualizan los campos que llegan en el body
    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre.trim();
    if (correo !== undefined) cambios.correo = correo.trim().toLowerCase();
    if (contrasena !== undefined) cambios.contrasena = await bcrypt.hash(contrasena, 10);
    if (edad !== undefined) cambios.edad = Number(edad);
    if (telefono !== undefined) cambios.telefono = String(telefono).trim();

    const campos = Object.keys(cambios);
    const sets = campos.map((campo, i) => `${campo} = $${i + 1}`);
    sets.push('fecha_actualizacion = CURRENT_TIMESTAMP');

    const { rows } = await pool.query(
      `UPDATE usuarios SET ${sets.join(', ')}
       WHERE id = $${campos.length + 1}
       RETURNING ${COLUMNAS}`,
      [...Object.values(cambios), id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con id ${id}.` });
    }
    res.status(200).json({ ok: true, mensaje: 'Usuario actualizado correctamente.', data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// DELETE /usuarios/:id -> Eliminar
async function eliminarUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`DELETE FROM usuarios WHERE id = $1 RETURNING ${COLUMNAS}`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con id ${id}.` });
    }
    res.status(200).json({ ok: true, mensaje: 'Usuario eliminado correctamente.', data: rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registrarUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
