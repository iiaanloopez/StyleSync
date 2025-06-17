// frontend/src/services/authService.js
import api from './api'; // Importa la instancia de Axios configurada
import { API_BASE_URL } from '../constants/api'; // Importa la URL base si la necesitas para construir endpoints

const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER_CLIENT: `${API_BASE_URL}/auth/register/client`,
    REGISTER_BARBER: `${API_BASE_URL}/auth/register/barber`,
};

/**
 * @desc    Realiza una solicitud de login al backend.
 * @param   {string} email - Correo electrónico del usuario.
 * @param   {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} Datos del usuario y token si el login es exitoso.
 * @throws  {Error} Si el login falla (ej. credenciales inválidas).
 */
const login = async (email, password) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
        // Almacena el token y la información del usuario en el almacenamiento local si el login es exitoso
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data)); // Guarda la info del usuario
        }
        return response.data;
    } catch (error) {
        // Lanza el error para que el componente que llama lo maneje
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Registra un nuevo cliente.
 * @param   {Object} userData - Datos del cliente (name, email, password, phone).
 * @returns {Promise<Object>} Datos del nuevo cliente y token.
 * @throws  {Error} Si el registro falla.
 */
const registerClient = async (userData) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.REGISTER_CLIENT, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Registra un nuevo barbero.
 * @param   {Object} userData - Datos del barbero (name, email, password, phone).
 * @returns {Promise<Object>} Datos del nuevo barbero y token.
 * @throws  {Error} Si el registro falla.
 */
const registerBarber = async (userData) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.REGISTER_BARBER, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Cierra la sesión del usuario.
 * Elimina el token y la información del usuario del almacenamiento local.
 */
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Puedes añadir una llamada a la API si tu backend tiene un endpoint de logout
    // await api.post('/api/auth/logout');
};

const authService = {
    login,
    registerClient,
    registerBarber,
    logout,
};

export default authService;
