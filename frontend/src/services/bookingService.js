// frontend/src/services/bookingService.js
import api from './api'; // Importa la instancia de Axios configurada
import { API_BASE_URL } from '../constants/api'; // Importa la URL base

const BOOKING_ENDPOINTS = {
    CREATE_BOOKING: `${API_BASE_URL}/bookings`,
    GET_USER_BOOKINGS: `${API_BASE_URL}/bookings/me`,
    GET_BOOKING_BY_ID: (id) => `${API_BASE_URL}/bookings/${id}`,
    UPDATE_BOOKING_STATUS: (id) => `${API_BASE_URL}/bookings/${id}/status`,
    RESCHEDULE_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}/reschedule`,
    CANCEL_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}`,
};

/**
 * @desc    Crea una nueva reserva.
 * @param   {Object} bookingData - Datos de la reserva (barberId, serviceId, date, time).
 * @returns {Promise<Object>} La reserva creada.
 * @throws  {Error} Si la petición falla.
 */
const createBooking = async (bookingData) => {
    try {
        const response = await api.post(BOOKING_ENDPOINTS.CREATE_BOOKING, bookingData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Obtiene las reservas del usuario autenticado (cliente o barbero).
 * @param   {string} [statusFilter] - Filtro de estado opcional (ej. 'upcoming', 'past').
 * @returns {Promise<Array>} Un array de objetos de reserva.
 * @throws  {Error} Si la petición falla.
 */
const getUserBookings = async (statusFilter = '') => {
    try {
        const params = statusFilter ? { status: statusFilter } : {};
        const response = await api.get(BOOKING_ENDPOINTS.GET_USER_BOOKINGS, { params });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Obtiene una reserva específica por ID.
 * @param   {string} id - El ID de la reserva.
 * @returns {Promise<Object>} Un objeto con la información de la reserva.
 * @throws  {Error} Si la petición falla o la reserva no es encontrada.
 */
const getBookingById = async (id) => {
    try {
        const response = await api.get(BOOKING_ENDPOINTS.GET_BOOKING_BY_ID(id));
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Actualiza el estado de una reserva (Barbero o Admin).
 * @param   {string} id - ID de la reserva.
 * @param   {string} status - El nuevo estado (ej. 'confirmed', 'completed', 'cancelled').
 * @returns {Promise<Object>} La reserva actualizada.
 * @throws  {Error} Si la petición falla.
 */
const updateBookingStatus = async (id, status) => {
    try {
        const response = await api.put(BOOKING_ENDPOINTS.UPDATE_BOOKING_STATUS(id), { status });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Reprograma una reserva (solo cliente).
 * @param   {string} id - ID de la reserva.
 * @param   {Object} newDateTime - Objeto con newDate y newTime.
 * @returns {Promise<Object>} La reserva reprogramada.
 * @throws  {Error} Si la petición falla.
 */
const rescheduleBooking = async (id, newDateTime) => {
    try {
        const response = await api.put(BOOKING_ENDPOINTS.RESCHEDULE_BOOKING(id), newDateTime);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Cancela una reserva.
 * @param   {string} id - ID de la reserva a cancelar.
 * @returns {Promise<Object>} Mensaje de éxito.
 * @throws  {Error} Si la petición falla.
 */
const cancelBooking = async (id) => {
    try {
        const response = await api.delete(BOOKING_ENDPOINTS.CANCEL_BOOKING(id));
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

const bookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
};

export default bookingService;
