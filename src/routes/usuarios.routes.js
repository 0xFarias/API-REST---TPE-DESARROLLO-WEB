// Rutas del recurso /usuarios
const { Router } = require('express');
const controlador = require('../controllers/usuarios.controller');
const { validarCrear, validarActualizar, validarId } = require('../middlewares/validarUsuario');

const router = Router();

router.post('/', validarCrear, controlador.registrarUsuario);          // Registrar
router.get('/', controlador.listarUsuarios);                            // Consultar
router.get('/:id', validarId, controlador.obtenerUsuario);              // Consultar por ID
router.put('/:id', validarId, validarActualizar, controlador.actualizarUsuario); // Actualizar
router.delete('/:id', validarId, controlador.eliminarUsuario);          // Eliminar

module.exports = router;
