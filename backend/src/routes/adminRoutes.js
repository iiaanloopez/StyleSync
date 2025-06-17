// backend/src/routes/adminRoutes.js
const express = require('express');
const { param, body, query } = require('express-validator'); // Para validación
const { protect } = require('../middlewares/authMiddleware'); // Middleware de autenticación
const adminProtect = require('../middlewares/adminMiddleware'); // Middleware específico de admin
const validateRequest = require('../middlewares/validateRequest'); // Middleware de validación

const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllBarbershops,
    updateBarbershopStatus,
    getAllBookings,
    moderateReview,
} = require('../controllers/adminController');

const router = express.Router();

// Todas las rutas de administración requieren autenticación y rol de 'admin'
// Se aplica protect y adminProtect a nivel de router para todas las rutas debajo
router.use(protect);
router.use(adminProtect);

// --- Rutas de Gestión de Usuarios ---

// @route   GET /api/admin/users
// @desc    Obtener todos los usuarios
// @access  Private (Admin)
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Obtener un usuario por ID
// @access  Private (Admin)
router.get(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('ID de usuario inválido.')
    ],
    validateRequest,
    getUserById
);

// @route   PUT /api/admin/users/:id
// @desc    Actualizar un usuario
// @access  Private (Admin)
router.put(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('ID de usuario inválido.'),
        body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
        body('email').optional().isEmail().withMessage('El correo electrónico debe ser válido.'),
        body('role')
            .optional()
            .isIn(['client', 'barber', 'admin']).withMessage('Rol de usuario inválido (client, barber, admin).'),
        body('phone').optional().isString().isLength({ min: 7 }).withMessage('El número de teléfono debe tener al menos 7 dígitos.')
    ],
    validateRequest,
    updateUser
);

// @route   DELETE /api/admin/users/:id
// @desc    Eliminar un usuario
// @access  Private (Admin)
router.delete(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('ID de usuario inválido.')
    ],
    validateRequest,
    deleteUser
);

// --- Rutas de Gestión de Barberías ---

// @route   GET /api/admin/barbershops
// @desc    Obtener todas las barberías
// @access  Private (Admin)
router.get(
    '/barbershops',
    [
        query('status')
            .optional()
            .isIn(['pending', 'approved', 'rejected'])
            .withMessage('Estado de barbería inválido (pending, approved, rejected).')
    ],
    validateRequest,
    getAllBarbershops
);

// @route   PUT /api/admin/barbershops/:id/status
// @desc    Aprobar o rechazar una barbería
// @access  Private (Admin)
router.put(
    '/barbershops/:id/status',
    [
        param('id').isMongoId().withMessage('ID de barbería inválido.'),
        body('status')
            .isIn(['pending', 'approved', 'rejected'])
            .withMessage('Estado de barbería inválido (pending, approved, rejected).')
    ],
    validateRequest,
    updateBarbershopStatus
);

// --- Rutas de Gestión de Reservas ---

// @route   GET /api/admin/bookings
// @desc    Obtener todas las reservas del sistema
// @access  Private (Admin)
router.get(
    '/bookings',
    [
        query('status')
            .optional()
            .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'])
            .withMessage('Estado de reserva inválido (pending, confirmed, completed, cancelled, rescheduled).')
    ],
    validateRequest,
    getAllBookings
);

// --- Rutas de Gestión de Reseñas ---

// @route   DELETE /api/admin/reviews/:id
// @desc    Moderar/Eliminar una reseña
// @access  Private (Admin)
router.delete(
    '/reviews/:id',
    [
        param('id').isMongoId().withMessage('ID de reseña inválido.')
    ],
    validateRequest,
    moderateReview
);

module.exports = router;
