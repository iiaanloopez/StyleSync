// backend/src/controllers/authController.js
const User = require('../models/User'); // Importa el modelo de usuario
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt'); // Importa la configuración JWT

/**
 * @desc    Función auxiliar para generar un token JWT
 * @param   {string} id - El ID del usuario para incluir en el token
 * @returns {string} El token JWT firmado
 */
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

/**
 * @desc    Registrar un nuevo cliente
 * @route   POST /api/auth/register/client
 * @access  Public
 */
const registerClient = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Comprobar si el usuario ya existe con este correo electrónico
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400); // Bad Request
            throw new Error('El usuario con este correo electrónico ya existe.');
        }

        // Crear un nuevo usuario con rol 'client'
        const user = await User.create({
            name,
            email,
            password, // La contraseña se hashea automáticamente en el pre-save hook del modelo User
            phone,
            role: 'client', // Asigna explícitamente el rol de cliente
        });

        if (user) {
            res.status(201).json({ // 201 Created
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id), // Genera y envía el token JWT
            });
        } else {
            res.status(400); // Bad Request
            throw new Error('Datos de usuario inválidos');
        }
    } catch (error) {
        next(error); // Pasa el error al middleware de manejo de errores
    }
};

/**
 * @desc    Registrar un nuevo barbero
 * @route   POST /api/auth/register/barber
 * @access  Public
 */
const registerBarber = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Comprobar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('El usuario con este correo electrónico ya existe.');
        }

        // Crear un nuevo usuario con rol 'barber'
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'barber', // Asigna explícitamente el rol de barbero
        });

        if (user) {
            // Nota: Para barberos, podrías querer un proceso de aprobación por parte del admin
            // antes de que puedan iniciar sesión o gestionar su perfil.
            // Por ahora, les permitimos iniciar sesión inmediatamente.
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Datos de barbero inválidos');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Buscar al usuario por correo electrónico
        const user = await User.findOne({ email });

        // Comprobar si el usuario existe y si la contraseña es correcta
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                profilePicture: user.profilePicture // Incluir la imagen de perfil
            });
        } else {
            res.status(401); // Unauthorized
            throw new Error('Correo electrónico o contraseña inválidos');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerClient,
    registerBarber,
    loginUser,
};