// backend/src/routes/barberRoutes.js
const express = require('express');
const { body, param } = require('express-validator'); // Para validación
const { protect, authorizeRoles } = require('../middlewares/authMiddleware'); // Middlewares de autenticación
const validateRequest = require('../middlewares/validateRequest'); // Middleware de validación
const { upload } = require('../config/storage'); // Para subida de archivos (Multer)

const {
    getAllBarbers,
    getBarberById,
    createOrUpdateBarberProfile,
    addService,
    updateService,
    deleteService,
    updateAvailability,
} = require('../controllers/barbersController');

const router = express.Router();

// --- Rutas Públicas (para clientes que buscan) ---

// @route   GET /api/barbers
// @desc    Obtener todos los barberos/barberías (con filtros opcionales)
// @access  Public
router.get('/', getAllBarbers);

// @route   GET /api/barbers/:id
// @desc    Obtener un barbero/barbería por ID
// @access  Public
router.get(
    '/:id',
    [
        param('id').isMongoId().withMessage('ID de barbero inválido.')
    ],
    validateRequest,
    getBarberById
);

// --- Rutas Privadas para Barberos ---

// @route   POST /api/barbers/profile
// @desc    Crear o actualizar el perfil del barbero autenticado
// @access  Private (Barber)
// `upload.single('profileImage')` maneja la subida de una única imagen llamada 'profileImage'
router.post(
    '/profile',
    protect, // Solo usuarios autenticados
    authorizeRoles(['barber']), // Solo barberos
    upload.single('profileImage'), // Procesa la subida de imagen antes del controlador
    [
        body('shopName').notEmpty().withMessage('El nombre de la barbería es requerido.'),
        body('address').notEmpty().withMessage('La dirección es requerida.'),
        body('phone').notEmpty().withMessage('El teléfono de la barbería es requerido.')
                      .isLength({ min: 7 }).withMessage('El número de teléfono debe tener al menos 7 dígitos.'),
        body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('La descripción no debe exceder 500 caracteres.'),
        body('coordinates') // Espera un array de [longitude, latitude]
            .optional()
            .isArray({ min: 2, max: 2 }).withMessage('Las coordenadas deben ser un array [longitud, latitud].')
            .custom(value => value.every(coord => typeof coord === 'number')).withMessage('Las coordenadas deben ser números.')
    ],
    validateRequest,
    createOrUpdateBarberProfile
);

// @route   POST /api/barbers/me/services
// @desc    Añadir un nuevo servicio
// @access  Private (Barber)
router.post(
    '/me/services',
    protect,
    authorizeRoles(['barber']),
    [
        body('name').notEmpty().withMessage('El nombre del servicio es requerido.'),
        body('price').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
        body('duration').isInt({ gt: 0 }).withMessage('La duración debe ser un número entero positivo en minutos.'),
        body('description').optional().isString().trim().isLength({ max: 200 }).withMessage('La descripción no debe exceder 200 caracteres.')
    ],
    validateRequest,
    addService
);

// @route   PUT /api/barbers/me/services/:serviceId
// @desc    Actualizar un servicio existente
// @access  Private (Barber)
router.put(
    '/me/services/:serviceId',
    protect,
    authorizeRoles(['barber']),
    [
        param('serviceId').isMongoId().withMessage('ID de servicio inválido.'),
        body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío.'),
        body('price').optional().isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),
        body('duration').optional().isInt({ gt: 0 }).withMessage('La duración debe ser un número entero positivo en minutos.'),
        body('description').optional().isString().trim().isLength({ max: 200 }).withMessage('La descripción no debe exceder 200 caracteres.')
    ],
    validateRequest,
    updateService
);

// @route   DELETE /api/barbers/me/services/:serviceId
// @desc    Eliminar un servicio
// @access  Private (Barber)
router.delete(
    '/me/services/:serviceId',
    protect,
    authorizeRoles(['barber']),
    [
        param('serviceId').isMongoId().withMessage('ID de servicio inválido.')
    ],
    validateRequest,
    deleteService
);

// @route   PUT /api/barbers/me/availability
// @desc    Actualizar la disponibilidad del barbero
// @access  Private (Barber)
router.put(
    '/me/availability',
    protect,
    authorizeRoles(['barber']),
    [
        // Validación básica para 'schedule'
        body('schedule').isObject().withMessage('El horario debe ser un objeto.'),
        // Puedes añadir validaciones más detalladas para la estructura del schedule aquí
        // Por ejemplo, que cada día sea un array de objetos con start/end válidos.
    ],
    validateRequest,
    updateAvailability
);

module.exports = router;
