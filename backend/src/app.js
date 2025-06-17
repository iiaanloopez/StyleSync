// backend/src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // Módulo nativo de Node.js para manejar rutas de archivos

// --- Importaciones de Middlewares Personalizados ---
const errorHandler = require('./middlewares/errorHandler'); // Middleware centralizado para manejo de errores

// --- Importaciones de Todas las Rutas de la API ---
// Cada uno de estos archivos define los endpoints para una funcionalidad específica.
const authRoutes = require('./routes/authRoutes');
const barberRoutes = require('./routes/barberRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Rutas para el panel de administración

// --- Inicialización de la Aplicación Express ---
const app = express();

// --- Middlewares Globales ---
// 1. Configuración de CORS (Cross-Origin Resource Sharing):
// Permite que tu frontend (que probablemente correrá en un dominio/puerto diferente)
// pueda hacer peticiones a tu backend.
app.use(cors());

// 2. Middleware para parsear el cuerpo de las peticiones en formato JSON:
// Esto es esencial para que Express pueda leer los datos JSON enviados en peticiones POST/PUT/PATCH.
app.use(express.json());

// 3. Servir archivos estáticos:
// Configura Express para servir archivos estáticos (ej. imágenes de perfil, fotos de barberías)
// desde la carpeta 'uploads'. Los archivos en 'backend/uploads' serán accesibles
// a través de '/uploads/<nombre_del_archivo>' en la URL de tu API.
// Por ejemplo: http://localhost:5000/uploads/mi_imagen.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// --- Registro de Rutas de la API ---
// Monta cada grupo de rutas bajo un prefijo '/api'.
// Esto organiza tus endpoints, por ejemplo:
// - /api/auth/register
// - /api/barbers/profile
// - /api/bookings
// - /api/admin/users

app.use('/api/auth', authRoutes);     // Rutas para autenticación (registro, login)
app.use('/api/barbers', barberRoutes); // Rutas para barberos y barberías (perfil, servicios, disponibilidad)
app.use('/api/bookings', bookingRoutes); // Rutas para la gestión de citas (reservar, ver, cancelar, reprogramar)
app.use('/api/reviews', reviewRoutes);   // Rutas para las reseñas y calificaciones
app.use('/api/admin', adminRoutes);     // Rutas para el panel de administración (gestión de usuarios, barberías, etc.)


// --- Ruta de Prueba Inicial ---
// Una ruta simple para verificar que el servidor está funcionando correctamente
// al acceder a la raíz de tu API (ej. http://localhost:5000/).
app.get('/', (req, res) => {
    res.send('Barber Booking API is running!');
});


// --- Middleware de Manejo de Errores ---
// Este middleware es el ÚLTIMO en ser registrado. Su propósito es capturar
// cualquier error que ocurra en las rutas o middlewares anteriores y enviar
// una respuesta JSON consistente al cliente.
app.use(errorHandler);

// Exporta la instancia de la aplicación Express para que pueda ser importada y utilizada
// por server.js para iniciar el servidor.
module.exports = app;
