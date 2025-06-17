// backend/src/services/authService.js
const User = require('../models/User'); // Importa el modelo de usuario
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt'); // Importa la configuración JWT

/**
 * @desc    Genera un token JWT para un usuario.
 * @param   {string} userId - El ID del usuario.
 * @returns {string} El token JWT.
 */
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

/**
 * @desc    Registra un nuevo usuario (cliente o barbero).
 * @param   {Object} userData - Datos del usuario (name, email, password, phone, role).
 * @returns {Object} El nuevo usuario creado y su token JWT.
 * @throws  {Error} Si el usuario ya existe o los datos son inválidos.
 */
const registerUser = async (userData) => {
    const { name, email, password, phone, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('El usuario con este correo electrónico ya existe.');
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'client', // Asegura un rol por defecto si no se especifica
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateAuthToken(user._id),
        };
    } else {
        throw new Error('Datos de usuario inválidos.');
    }
};

/**
 * @desc    Autentica un usuario y devuelve su información con un token JWT.
 * @param   {string} email - Correo electrónico del usuario.
 * @param   {string} password - Contraseña del usuario.
 * @returns {Object} La información del usuario y su token JWT.
 * @throws  {Error} Si las credenciales son inválidas.
 */
const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateAuthToken(user._id),
        };
    } else {
        throw new Error('Correo electrónico o contraseña inválidos.');
    }
};

module.exports = {
    generateAuthToken,
    registerUser,
    loginUser,
};
