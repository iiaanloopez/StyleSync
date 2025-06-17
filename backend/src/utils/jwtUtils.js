// backend/src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt'); // Importar la configuración JWT

/**
 * @desc    Genera un JSON Web Token (JWT).
 * @param   {string} id - El ID del usuario que se incluirá en el token.
 * @returns {string} El token JWT generado.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

/**
 * @desc    Verifica un JSON Web Token (JWT).
 * @param   {string} token - El token JWT a verificar.
 * @returns {Object} El payload decodificado del token si es válido.
 * @throws  {Error} Si el token es inválido o ha expirado.
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (error) {
        // Manejar diferentes errores de JWT (TokenExpiredError, JsonWebTokenError)
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token de autenticación expirado.');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token de autenticación inválido.');
        } else {
            throw new Error('Error al verificar el token de autenticación.');
        }
    }
};

/**
 * @desc    Decodifica un JSON Web Token (JWT) sin verificar su validez (solo lectura de payload).
 * Útil para inspeccionar el contenido del token, pero NO para autenticación.
 * @param   {string} token - El token JWT a decodificar.
 * @returns {Object|null} El payload decodificado o null si no se puede decodificar.
 */
const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
};
