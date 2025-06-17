// backend/src/middlewares/adminMiddleware.js
const { authorizeRoles } = require('./authMiddleware'); // Importa la función authorizeRoles

/**
 * @desc Middleware para asegurar que solo los usuarios con rol 'admin' puedan acceder a la ruta.
 * Internamente, utiliza el middleware general de autorización de roles configurándolo para 'admin'.
 * Se debe usar DESPUÉS del middleware 'protect'.
 */
const adminProtect = authorizeRoles(['admin']);

module.exports = adminProtect;

/*
// --- Ejemplo de cómo se usaría en una ruta (Esto NO va en este archivo) ---
// adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('./authMiddleware'); // Necesitas proteger la ruta primero
const adminProtect = require('./adminMiddleware'); // Importa el middleware de admin
const adminController = require('../controllers/adminController');

// Ejemplo de una ruta que solo un administrador puede acceder
// La secuencia de middlewares es importante: protect -> adminProtect -> controlador
router.get('/users', protect, adminProtect, adminController.getAllUsers);

// Otro ejemplo: eliminar un usuario, también solo para admins
router.delete('/users/:id', protect, adminProtect, adminController.deleteUser);

module.exports = router;
*/
