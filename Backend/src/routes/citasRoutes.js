const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, citasController.crearCita);

// Ruta para traer las citas del usuario logueado
router.get('/mis-citas', authMiddleware, citasController.obtenerMisCitas);
router.get('/todas', authMiddleware, citasController.obtenerTodasCitas);

router.put('/estado/:id_cita', authMiddleware, citasController.actualizarEstado);

module.exports = router;
