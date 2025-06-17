// backend/src/utils/passwordHasher.js
const bcrypt = require('bcryptjs');

/**
 * @desc    Hashea una contraseña usando bcryptjs.
 * @param   {string} password - La contraseña en texto plano.
 * @returns {Promise<string>} La contraseña hasheada.
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Genera un "salt" (valor aleatorio)
    return await bcrypt.hash(password, salt); // Hashea la contraseña con el salt
};

/**
 * @desc    Compara una contraseña en texto plano con una contraseña hasheada.
 * @param   {string} enteredPassword - La contraseña en texto plano ingresada.
 * @param   {string} hashedPassword - La contraseña hasheada almacenada.
 * @returns {Promise<boolean>} True si las contraseñas coinciden, false en caso contrario.
 */
const comparePasswords = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePasswords,
};
