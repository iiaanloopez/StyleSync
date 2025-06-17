// backend/src/config/storage.js
const multer = require('multer');
const path = require('path');
const config = require('./index'); // Importa las configuraciones desde index.js

// Asegúrate de que la carpeta 'uploads' exista en la raíz de tu backend
// Puedes crearla manualmente o añadir un script para ello.

// Configuración de almacenamiento local para Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La carpeta 'uploads' estará en la raíz del backend (fuera de 'src')
        cb(null, path.join(__dirname, '../../', config.uploadDir));
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único para evitar colisiones
        // Ej: 'nombre_original_del_archivo-timestamp.extension'
        cb(null, `${file.originalname.split('.')[0]}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Filtro para aceptar solo ciertos tipos de archivos (ej. imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)!'), false);
    }
};

// Configuración principal de Multer para la subida de archivos
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de tamaño de archivo (5 MB)
    },
    fileFilter: fileFilter
});

module.exports = { upload };

// NOTA: Si utilizas servicios como Cloudinary, la implementación aquí cambiaría.
// Por ejemplo, para Cloudinary, necesitarías instalar 'cloudinary' y configurar su API.
/*
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-cloudinary');

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barber-booking-app', // Carpeta en Cloudinary
        format: async (req, file) => 'png', // Formato de la imagen
        public_id: (req, file) => `${file.originalname.split('.')[0]}-${Date.now()}` // ID público
    },
});

const cloudinaryUpload = multer({ storage: cloudinaryStorage, fileFilter: fileFilter });
module.exports = { upload: cloudinaryUpload }; // Exporta la configuración de Cloudinary en su lugar
*/