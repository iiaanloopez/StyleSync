// backend/src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator'); // Para validación de datos de entrada

const {
    registerClient,
    registerBarber,
    loginUser,
} = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest'); // Middleware de validación

const router = express.Router();

// --- Rutas de Registro ---

// @route   POST /api/auth/register/client
// @desc    Registrar un nuevo cliente
// @access  Public
router.post(
    '/register/client',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('El nombre es requerido.'),
        body('email')
            .isEmail().withMessage('El correo electrónico debe ser válido.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('phone')
            .optional() // El campo es opcional
            .isString().withMessage('El número de teléfono debe ser una cadena de texto.')
            .isLength({ min: 7 }).withMessage('El número de teléfono debe tener al menos 7 dígitos.')
    ],
    validateRequest, // Aplica el middleware de validación
    registerClient
);

// @route   POST /api/auth/register/barber
// @desc    Registrar un nuevo barbero
// @access  Public
router.post(
    '/register/barber',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('El nombre es requerido.'),
        body('email')
            .isEmail().withMessage('El correo electrónico debe ser válido.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('phone')
            .isString().withMessage('El número de teléfono debe ser una cadena de texto.')
            .isLength({ min: 7 }).withMessage('El número de teléfono debe tener al menos 7 dígitos.')
    ],
    validateRequest, // Aplica el middleware de validación
    registerBarber
);

// --- Ruta de Login ---

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('El correo electrónico debe ser válido.')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida.')
    ],
    validateRequest, // Aplica el middleware de validación
    loginUser
);

module.exports = router;
