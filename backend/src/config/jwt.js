// backend/src/config/jwt.js
const config = require('./index'); // Importa las configuraciones desde index.js

module.exports = {
    // Secreto utilizado para firmar y verificar los tokens JWT
    // ¡Es crucial mantener esto seguro y como una variable de entorno!
    jwtSecret: config.jwtSecret,

    // Tiempo de expiración de los tokens JWT (ej. '1h', '7d', '30m')
    jwtExpiresIn: config.jwtExpiresIn,
};