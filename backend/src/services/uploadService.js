// backend/src/services/uploadService.js
const fs = require('fs').promises; // Para operaciones de sistema de archivos asíncronas
const path = require('path');
const config = require('../config'); // Para acceder a la configuración de la carpeta de uploads

/**
 * @desc    Elimina un archivo del sistema de archivos local.
 * @param   {string} filePath - La ruta relativa o absoluta del archivo a eliminar.
 * Normalmente, será la URL guardada en la DB (ej. '/uploads/image.jpg').
 * @returns {boolean} True si el archivo fue eliminado, false si no existía o hubo un error.
 */
const deleteFile = async (filePath) => {
    if (!filePath) {
        console.warn('Attempted to delete file with empty path.');
        return false;
    }

    // Construye la ruta absoluta al archivo
    // Asume que filePath es como '/uploads/my_image.jpg' y uploadDir es 'uploads'
    // Convertimos de la URL pública a la ruta física en el sistema de archivos
    const fileName = path.basename(filePath);
    const absolutePath = path.join(__dirname, '../../', config.uploadDir, fileName);

    try {
        // Verifica si el archivo existe antes de intentar eliminarlo
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
        console.log(`File deleted successfully: ${absolutePath}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') { // ENOENT: Error No ENTry (file or directory does not exist)
            console.warn(`Attempted to delete non-existent file: ${absolutePath}`);
            return false; // File did not exist
        }
        console.error(`Error deleting file ${absolutePath}:`, error.message);
        throw new Error(`Could not delete file: ${error.message}`);
    }
};

// Si utilizas Cloudinary o AWS S3, este servicio contendría las funciones
// para eliminar archivos de esos servicios.

module.exports = {
    deleteFile,
};
