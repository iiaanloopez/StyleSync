// backend/src/routes/bookingRoutes.js
const express = require('express');
const { body, param, query } = require('express-validator'); // Para validación
const { protect, authorizeRoles } = require('../middlewares/authMiddleware'); // Middlewares de autenticación
const validateRequest = require('../middlewares/validateRequest'); // Middleware de validación

const {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
} = require('../controllers/bookingsController');

const router = express.Router();

// --- Rutas para Clientes ---

// @route   POST /api/bookings
// @desc    Crear una nueva reserva
// @access  Private (Client)
router.post(
    '/',
    protect,
    authorizeRoles(['client']),
    [
        body('barberId').isMongoId().withMessage('ID de barbero inválido.'),
        body('serviceId').isMongoId().withMessage('ID de servicio inválido.'),
        body('date').isISO8601().toDate().withMessage('La fecha debe ser un formato de fecha válido (YYYY-MM-DD).')
            .custom((value) => {
                if (new Date(value) < new Date()) {
                    throw new Error('La fecha de la reserva no puede ser en el pasado.');
                }
                return true;
            }),
        body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM (ej. 14:30).')
    ],
    validateRequest,
    createBooking
);

// @route   GET /api/bookings/me
// @desc    Obtener las reservas del usuario autenticado (cliente o barbero)
// @access  Private (Client, Barber)
router.get(
    '/me',
    protect,
    authorizeRoles(['client', 'barber']), // Clientes y Barberos pueden ver sus propias reservas
    [
        query('status')
            .optional()
            .isIn(['upcoming', 'past', 'cancelled', 'completed'])
            .withMessage('El estado de la reserva es inválido (upcoming, past, cancelled, completed).')
    ],
    validateRequest,
    getUserBookings
);

// @route   GET /api/bookings/:id
// @desc    Obtener una reserva específica por ID
// @access  Private (Client o Barber que le pertenece, o Admin)
router.get(
    '/:id',
    protect,
    // La autorización se maneja dentro del controlador (getBookingById)
    [
        param('id').isMongoId().withMessage('ID de reserva inválido.')
    ],
    validateRequest,
    getBookingById
);

// @route   PUT /api/bookings/:id/reschedule
// @desc    Reprogramar una reserva
// @access  Private (Client)
router.put(
    '/:id/reschedule',
    protect,
    authorizeRoles(['client']),
    [
        param('id').isMongoId().withMessage('ID de reserva inválido.'),
        body('newDate').isISO8601().toDate().withMessage('La nueva fecha debe ser un formato de fecha válido (YYYY-MM-DD).')
            .custom((value) => {
                if (new Date(value) < new Date()) {
                    throw new Error('La nueva fecha de la reserva no puede ser en el pasado.');
                }
                return true;
            }),
        body('newTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La nueva hora debe tener formato HH:MM (ej. 14:30).')
    ],
    validateRequest,
    rescheduleBooking
);

// @route   PUT /api/bookings/:id/status
// @desc    Actualizar el estado de una reserva (Barbero o Admin)
// @access  Private (Barber, Admin)
router.put(
    '/:id/status',
    protect,
    authorizeRoles(['barber', 'admin']), // Solo barberos o administradores pueden cambiar el estado
    [
        param('id').isMongoId().withMessage('ID de reserva inválido.'),
        body('status')
            .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'])
            .withMessage('Estado de reserva inválido.')
    ],
    validateRequest,
    updateBookingStatus
);


// @route   DELETE /api/bookings/:id
// @desc    Cancelar una reserva
// @access  Private (Client o Barber que le pertenece, o Admin)
router.delete(
    '/:id',
    protect,
    // La autorización se maneja dentro del controlador (cancelBooking)
    [
        param('id').isMongoId().withMessage('ID de reserva inválido.')
    ],
    validateRequest,
    cancelBooking
);

module.exports = router;
