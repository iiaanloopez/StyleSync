// backend/src/routes/reviewRoutes.js
const express = require('express');
const { body, param } = require('express-validator'); // Para validación
const { protect, authorizeRoles } = require('../middlewares/authMiddleware'); // Middlewares de autenticación
const validateRequest = require('../middlewares/validateRequest'); // Middleware de validación

const {
    createReview,
    getBarberReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewsController');

const router = express.Router();

// --- Rutas de Reseñas ---

// @route   POST /api/reviews
// @desc    Crear una nueva reseña para un barbero/barbería
// @access  Private (Client)
router.post(
    '/',
    protect,
    authorizeRoles(['client']),
    [
        body('barberId').isMongoId().withMessage('ID de barbero inválido.'),
        body('bookingId').isMongoId().withMessage('ID de reserva inválido.'),
        body('rating')
            .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser un número entre 1 y 5.'),
        body('comment')
            .optional()
            .isString().withMessage('El comentario debe ser texto.')
            .isLength({ max: 500 }).withMessage('El comentario no puede exceder los 500 caracteres.')
    ],
    validateRequest,
    createReview
);

// @route   GET /api/reviews/:barberId
// @desc    Obtener todas las reseñas para un barbero/barbería específica
// @access  Public
router.get(
    '/:barberId',
    [
        param('barberId').isMongoId().withMessage('ID de barbero inválido.')
    ],
    validateRequest,
    getBarberReviews
);

// @route   PUT /api/reviews/:id
// @desc    Actualizar una reseña (solo el autor de la reseña)
// @access  Private (Client - owner of review)
router.put(
    '/:id',
    protect,
    authorizeRoles(['client']), // Solo clientes pueden actualizar sus propias reseñas
    [
        param('id').isMongoId().withMessage('ID de reseña inválido.'),
        body('rating')
            .optional()
            .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser un número entre 1 y 5.'),
        body('comment')
            .optional()
            .isString().withMessage('El comentario debe ser texto.')
            .isLength({ max: 500 }).withMessage('El comentario no puede exceder los 500 caracteres.')
    ],
    validateRequest,
    updateReview
);

// @route   DELETE /api/reviews/:id
// @desc    Eliminar una reseña (solo el autor o un administrador)
// @access  Private (Client - owner of review, Admin)
router.delete(
    '/:id',
    protect,
    // La autorización del rol se maneja dentro del controlador (deleteReview)
    [
        param('id').isMongoId().withMessage('ID de reseña inválido.')
    ],
    validateRequest,
    deleteReview
);

module.exports = router;
