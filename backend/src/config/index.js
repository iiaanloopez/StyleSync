// backend/src/config/index.js

// Carga las variables de entorno desde el archivo .env
// Asegúrate de que este archivo se cargue al inicio de tu aplicación (ej. en server.js)
require('dotenv').config();

module.exports = {
    // Configuración general de la aplicación
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development', // 'development', 'production', 'test'

    // Configuración de la base de datos (MongoDB)
    mongoURI: process.env.MONGO_URI,

    // Configuración JWT para autenticación
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

    // Configuración de correo electrónico (para notificaciones, recuperación de contraseña, etc.)
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'no-reply@barberbooking.com',
    },

    // Configuración de Stripe (para pagos)
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // Para verificar eventos de webhook
    },

    // Rutas para almacenamiento de archivos (ej. imágenes de perfil, barberías)
    uploadDir: process.env.UPLOAD_DIR || 'uploads', // Carpeta donde se guardarán los archivos
    // Opciones de Cloudinary si decides usarlo en lugar de almacenamiento local
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    }
};