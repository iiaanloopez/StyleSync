// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa el modelo de usuario para buscarlo por ID
const { jwtSecret } = require('../config/jwt'); // Importa el secreto JWT desde la configuración

/**
 * @desc Middleware para proteger rutas, asegurando que solo usuarios autenticados puedan acceder.
 * Verifica un token JWT enviado en el encabezado de autorización (Bearer Token).
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Comprueba si el encabezado de autorización existe y empieza con 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extrae el token (omitiendo la parte 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifica el token usando el secreto JWT
            // jwt.verify devuelve el payload del token si es válido
            const decoded = jwt.verify(token, jwtSecret);

            // 4. Busca al usuario en la base de datos por el ID decodificado del token
            // y selecciona todos los campos excepto la contraseña por seguridad
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Si el usuario no se encuentra en la base de datos
            if (!req.user) {
                res.status(401); // 401 Unauthorized
                throw new Error('Usuario no encontrado o token inválido.');
            }

            // 6. Si todo es correcto, pasa el control al siguiente middleware o controlador
            next();
        } catch (error) {
            console.error('Error en el middleware de autenticación:', error.message);
            res.status(401); // 401 Unauthorized
            // Mensaje más genérico para el cliente en producción por seguridad
            throw new Error('No autorizado, token fallido o no válido.');
        }
    }

    // Si no se proporcionó ningún token en el encabezado de autorización
    if (!token) {
        res.status(401); // 401 Unauthorized
        throw new Error('No autorizado, no se proporcionó token.');
    }
};

/**
 * @desc Middleware para restringir el acceso a rutas basadas en el rol del usuario.
 * Requiere que 'protect' se ejecute antes para que 'req.user' esté disponible.
 * @param {Array<string>} roles - Un array de roles permitidos (ej: ['admin', 'barber', 'client'])
 * @returns {Function} Un middleware de Express que verifica los roles
 */
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        // Asegúrate de que 'req.user' esté disponible (viene del middleware 'protect')
        if (!req.user) {
            res.status(401); // No autorizado si no hay información de usuario
            throw new Error('No autenticado para acceder a esta ruta.');
        }

        // Comprueba si el rol del usuario autenticado está incluido en los roles permitidos
        if (!roles.includes(req.user.role)) {
            res.status(403); // 403 Forbidden (Prohibido)
            throw new Error(`Acceso denegado. El rol de ${req.user.role} no tiene permisos para esta acción.`);
        }
        // Si el rol es permitido, pasa el control al siguiente middleware o controlador
        next();
    };
};

module.exports = { protect, authorizeRoles };
