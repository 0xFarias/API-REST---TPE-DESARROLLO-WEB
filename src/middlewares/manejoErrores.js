// Manejo centralizado de errores y de rutas inexistentes

// 404: la ruta solicitada no existe
function rutaNoEncontrada(req, res) {
  res.status(404).json({ ok: false, mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.` });
}

// Convierte cualquier error en una respuesta HTTP adecuada
// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  // JSON mal escrito en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El JSON enviado no es válido. Revise comas y comillas.' });
  }

  // Errores de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ ok: false, mensaje: 'Ya existe un usuario registrado con ese correo.' });
  }
  if (err.code === '23514' || err.code === '22P02' || err.code === '22001' || err.code === '22003') {
    return res.status(400).json({ ok: false, mensaje: 'Los datos no cumplen las restricciones de la base de datos.' });
  }
  if (['ECONNREFUSED', '28P01', '3D000', '42P01'].includes(err.code)) {
    console.error('Error de base de datos:', err.message);
    return res.status(503).json({ ok: false, mensaje: 'No se pudo acceder a la base de datos. Intente más tarde.' });
  }

  console.error(err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
