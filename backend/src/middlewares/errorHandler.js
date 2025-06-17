// backend/src/middlewares/errorHandler.js

/**
 * @desc Middleware centralizado para el manejo de errores en Express.
 * Captura los errores que ocurren en las rutas o middlewares anteriores
 * y envía una respuesta JSON consistente al cliente.
 * Es crucial que este middleware se registre como el ÚLTIMO en app.js.
 * @param {Error} err - El objeto de error que fue lanzado o pasado a next().
 * @param {Object} req - Objeto de la petición Express.
 * @param {Object} res - Objeto de la respuesta Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware (aunque aquí generalmente se detiene la cadena).
 */
const errorHandler = (err, req, res, next) => {
    // Determina el código de estado HTTP de la respuesta.
    // Si res.statusCode ya fue establecido (ej. por un `res.status(400); throw new Error(...)`), lo usa.
    // Si no, y el código actual es 200 (éxito), lo cambia a 500 (Internal Server Error) para indicar un fallo.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Envía una respuesta JSON con el mensaje de error y, opcionalmente, el stack trace.
    res.json({
        message: err.message,
        // Incluye el stack trace solo en el entorno de desarrollo para depuración.
        // En producción, es una mala práctica de seguridad exponer información detallada del error.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
