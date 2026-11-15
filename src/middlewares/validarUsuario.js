// Validaciones de los datos del usuario (mismas reglas del formulario de registro)

const REGLAS = {
  nombre: {
    validar: (v) => typeof v === 'string' && /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{3,100}$/.test(v.trim()),
    mensaje: 'El nombre es obligatorio, solo admite letras y espacios (3 a 100 caracteres).',
  },
  correo: {
    validar: (v) => typeof v === 'string' && v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    mensaje: 'El correo no tiene un formato válido (ejemplo: usuario@correo.com).',
  },
  contrasena: {
    validar: (v) => typeof v === 'string' && v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v),
    mensaje: 'La contraseña debe tener al menos 8 caracteres, con letras y números.',
  },
  edad: {
    validar: (v) => (typeof v === 'number' || typeof v === 'string') && /^\d{1,3}$/.test(String(v).trim())
      && Number(v) >= 1 && Number(v) <= 120,
    mensaje: 'La edad debe ser un número entero entre 1 y 120.',
  },
  telefono: {
    validar: (v) => /^09\d{8}$/.test(String(v ?? '').trim()),
    mensaje: 'El teléfono debe tener 10 dígitos y empezar con 09 (ejemplo: 0991234567).',
  },
};

const CAMPOS = Object.keys(REGLAS);

// Revisa los campos recibidos y devuelve una lista de errores
function obtenerErrores(body, camposRequeridos) {
  const errores = [];
  for (const campo of CAMPOS) {
    const valor = body[campo];
    const vacio = valor === undefined || valor === null || String(valor).trim() === '';

    if (vacio) {
      if (camposRequeridos.includes(campo)) {
        errores.push({ campo, mensaje: `El campo "${campo}" es obligatorio.` });
      }
      continue;
    }
    if (!REGLAS[campo].validar(valor)) {
      errores.push({ campo, mensaje: REGLAS[campo].mensaje });
    }
  }
  return errores;
}

function cuerpoValido(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ ok: false, mensaje: 'Debe enviar los datos en formato JSON.' });
    return false;
  }
  return true;
}

// POST: todos los campos son obligatorios
function validarCrear(req, res, next) {
  if (!cuerpoValido(req, res)) return;
  const errores = obtenerErrores(req.body, CAMPOS);
  if (errores.length) {
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos.', errores });
  }
  next();
}

// PUT: se puede enviar uno o varios campos para actualizar
function validarActualizar(req, res, next) {
  if (!cuerpoValido(req, res)) return;
  const recibidos = CAMPOS.filter((c) => req.body[c] !== undefined);
  if (recibidos.length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `Debe enviar al menos un campo para actualizar: ${CAMPOS.join(', ')}.`,
    });
  }
  const errores = obtenerErrores(req.body, recibidos);
  if (errores.length) {
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos.', errores });
  }
  next();
}

// Valida que el :id de la URL sea un número entero positivo
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({ ok: false, mensaje: 'El id debe ser un número entero positivo.' });
  }
  next();
}

module.exports = { validarCrear, validarActualizar, validarId };
