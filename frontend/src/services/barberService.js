// frontend/src/services/barberService.js
import api from './api'; // Importa la instancia de Axios configurada
import { API_BASE_URL } from '../constants/api'; // Importa la URL base para construir endpoints

const BARBER_ENDPOINTS = {
    GET_ALL: `${API_BASE_URL}/barbers`,
    GET_BY_ID: (id) => `${API_BASE_URL}/barbers/${id}`,
    // Endpoints para el barbero autenticado (requieren token)
    PROFILE: `${API_BASE_URL}/barbers/profile`, // Para crear/actualizar perfil
    MY_SERVICES: `${API_BASE_URL}/barbers/me/services`,
    MY_SERVICE_BY_ID: (serviceId) => `${API_BASE_URL}/barbers/me/services/${serviceId}`,
    MY_AVAILABILITY: `${API_BASE_URL}/barbers/me/availability`,
};

/**
 * @desc    Obtiene todos los barberos/barberías del backend.
 * @param   {Object} [filters={}] - Objeto de filtros opcionales (ej. { location: 'Madrid' }).
 * @returns {Promise<Array>} Un array de objetos de barberos.
 * @throws  {Error} Si la petición falla.
 */
const getAllBarbers = async (filters = {}) => {
    try {
        const response = await api.get(BARBER_ENDPOINTS.GET_ALL, { params: filters });
        return response.data.data; // Asumiendo que la respuesta es { success: true, count: N, data: [] }
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Obtiene la información detallada de un barbero/barbería por su ID.
 * @param   {string} id - El ID del barbero/barbería.
 * @returns {Promise<Object>} Un objeto con la información del barbero.
 * @throws  {Error} Si la petición falla o el barbero no es encontrado.
 */
const getBarberById = async (id) => {
    try {
        const response = await api.get(BARBER_ENDPOINTS.GET_BY_ID(id));
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Crea o actualiza el perfil del barbero autenticado.
 * @param   {FormData} profileData - Datos del perfil (puede incluir un archivo para la imagen).
 * Debe ser FormData si incluye `profileImage`.
 * @returns {Promise<Object>} El perfil del barbero actualizado/creado.
 * @throws  {Error} Si la petición falla.
 */
const createOrUpdateBarberProfile = async (profileData) => {
    try {
        // Axios detectará automáticamente el Content-Type como 'multipart/form-data' si se envía FormData
        const response = await api.post(BARBER_ENDPOINTS.PROFILE, profileData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Asegúrate de que se envíe como FormData
            },
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Añade un nuevo servicio para el barbero autenticado.
 * @param   {Object} serviceData - Datos del servicio (name, price, duration, description).
 * @returns {Promise<Object>} El servicio creado.
 * @throws  {Error} Si la petición falla.
 */
const addService = async (serviceData) => {
    try {
        const response = await api.post(BARBER_ENDPOINTS.MY_SERVICES, serviceData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Actualiza un servicio existente del barbero autenticado.
 * @param   {string} serviceId - ID del servicio a actualizar.
 * @param   {Object} updateData - Datos para actualizar el servicio.
 * @returns {Promise<Object>} El servicio actualizado.
 * @throws  {Error} Si la petición falla.
 */
const updateService = async (serviceId, updateData) => {
    try {
        const response = await api.put(BARBER_ENDPOINTS.MY_SERVICE_BY_ID(serviceId), updateData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Elimina un servicio del barbero autenticado.
 * @param   {string} serviceId - ID del servicio a eliminar.
 * @returns {Promise<Object>} Mensaje de éxito.
 * @throws  {Error} Si la petición falla.
 */
const deleteService = async (serviceId) => {
    try {
        const response = await api.delete(BARBER_ENDPOINTS.MY_SERVICE_BY_ID(serviceId));
        return response.data; // Puede ser { success: true, message: 'Servicio eliminado...' }
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Actualiza la disponibilidad horaria del barbero autenticado.
 * @param   {Object} availabilityData - Objeto con la disponibilidad (ej. { schedule: {...}, specialDates: [...] }).
 * @returns {Promise<Object>} La disponibilidad actualizada.
 * @throws  {Error} Si la petición falla.
 */
const updateAvailability = async (availabilityData) => {
    try {
        const response = await api.put(BARBER_ENDPOINTS.MY_AVAILABILITY, availabilityData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};


const barberService = {
    getAllBarbers,
    getBarberById,
    createOrUpdateBarberProfile,
    addService,
    updateService,
    deleteService,
    updateAvailability,
};

export default barberService;
