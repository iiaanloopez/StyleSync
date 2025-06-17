// backend/src/middlewares/validateRequest.js
const { validationResult } = require('express-validator');

/**
 * @desc Middleware para procesar y manejar los resultados de las validaciones de express-validator.
 * Si se encuentran errores de validación, detiene la cadena de middleware y envía
 * una respuesta 400 (Bad Request) con los detalles de los errores.
 * De lo contrario, permite que la petición continúe al siguiente middleware/controlador.
 */
const validateRequest = (req, res, next) => {
    // Obtiene los errores de validación de la petición actual
    const errors = validationResult(req);

    // Si el array de errores NO está vacío, significa que hay errores de validación
    if (!errors.isEmpty()) {
        // Detiene la ejecución y envía una respuesta 400 con los errores
        return res.status(400).json({
            success: false,
            errors: errors.array(), // Envía los errores en un formato de array
            message: 'Errores de validación en la petición.',
        });
    }
    // Si no hay errores, pasa al siguiente middleware o controlador
    next();
};

module.exports = validateRequest;

/*
// --- Ejemplo de cómo se usaría en una ruta (Esto NO va en este archivo) ---
// authRoutes.js o cualquier archivo de rutas donde necesites validación

const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Importar funciones de validación
const validateRequest = require('../middlewares/validateRequest'); // Importar el middleware de validación
const authController = require('../controllers/authController');

router.post(
    '/register/client',
    [
        // Reglas de validación para los campos del body
        body('name')
            .notEmpty().withMessage('El nombre es requerido.')
            .trim(),
        body('email')
            .isEmail().withMessage('El correo electrónico debe ser una dirección válida.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('phone')
            .optional() // El campo es opcional
            .isMobilePhone('any').withMessage('El número de teléfono debe ser válido.') // Valida como número de teléfono
    ],
    validateRequest, // Este middleware se ejecuta DESPUÉS de las reglas de validación
    authController.registerClient // Y ANTES del controlador final
);

module.exports = router;
*/
