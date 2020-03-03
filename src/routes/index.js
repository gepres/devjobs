const express = require('express');
const router = express.Router();
const homeController = require('../controllers/HomeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/UsuariosController')
const authController = require('../controllers/AuthController')

// leer los datos
router.get('/', homeController.mostrarTrabajos)

// crear vacantes
router.get('/vacantes/nueva',authController.verificarUsuario, vacantesController.formularioNuevaVacante)
router.post('/vacantes/nueva',vacantesController.validarVacante,vacantesController.agregarVacante)

// mostrar vacante
router.get('/vacantes/:url',vacantesController.monstrarVacante)

//editar vacante
router.get('/vacantes/editar/:url',authController.verficarUserVacante,vacantesController.formEditarVacante)
router.post('/vacantes/editar/:url',authController.verficarUserVacante,vacantesController.validarVacante,vacantesController.editarVacante)

// Eliminar vacantes
router.delete('/vacantes/eliminar/:id',vacantesController.eliminarVacante)



// Crear cuentas
router.get('/crear-cuenta',usuariosController.formCrearCuenta)
router.post('/crear-cuenta',usuariosController.validarRegistro,usuariosController.crearUsuario)

// autenticar usuarios
router.get('/iniciar-sesion',usuariosController.formIniciarSesion)
router.post('/iniciar-sesion',authController.auntenticarUsuario)

// cerrar sesion
router.get('/cerrar-sesion',authController.verificarUsuario,authController.cerrarSesion)

// Resetear password (email)
router.get('/reestablecer-password',authController.formRestablecerPassword)
router.post('/reestablecer-password',authController.enviarToken)

// Resetear password ( Almacenar la base de datos)
router.get('/reestablecer-password/:token',authController.reestablecerPassword)
router.post('/reestablecer-password/:token',authController.guardarPassword)

// panel de administracion
router.get('/administracion',authController.verificarUsuario,authController.mostrarPanel)

// editar perfil
router.get('/editar-perfil',authController.verificarUsuario,usuariosController.formEditarPerfil)
// usuariosController.ValidarPerfil
router.post('/editar-perfil',authController.verificarUsuario,usuariosController.subirImagen,usuariosController.editarPerfil)

// recibir mensajes de candidatos
router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.contactar)

// Muestra los candidatos por vacante
router.get('/candidatos/:id',authController.verificarUsuario,vacantesController.mostrarCandidatos)

// buscador de vacantes
router.post('/buscador',vacantesController.buscarVacantes)

module.exports = router;
