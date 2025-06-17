// frontend/src/services/reviewService.js
import api from './api'; // Importa la instancia de Axios configurada
import { API_BASE_URL } from '../constants/api'; // Importa la URL base

const REVIEW_ENDPOINTS = {
    CREATE_REVIEW: `${API_BASE_URL}/reviews`,
    GET_BARBER_REVIEWS: (barberId) => `${API_BASE_URL}/reviews/${barberId}`,
    UPDATE_REVIEW: (id) => `${API_BASE_URL}/reviews/${id}`,
    DELETE_REVIEW: (id) => `${API_BASE_URL}/reviews/${id}`,
};

/**
 * @desc    Crea una nueva reseña para un barbero.
 * @param   {Object} reviewData - Datos de la reseña (barberId, bookingId, rating, comment).
 * @returns {Promise<Object>} La reseña creada.
 * @throws  {Error} Si la petición falla.
 */
const createReview = async (reviewData) => {
    try {
        const response = await api.post(REVIEW_ENDPOINTS.CREATE_REVIEW, reviewData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Obtiene todas las reseñas para un barbero específico.
 * @param   {string} barberId - ID del barbero.
 * @returns {Promise<Array>} Un array de objetos de reseña.
 * @throws  {Error} Si la petición falla.
 */
const getBarberReviews = async (barberId) => {
    try {
        const response = await api.get(REVIEW_ENDPOINTS.GET_BARBER_REVIEWS(barberId));
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Actualiza una reseña existente.
 * @param   {string} id - ID de la reseña a actualizar.
 * @param   {Object} updateData - Datos para actualizar (rating, comment).
 * @returns {Promise<Object>} La reseña actualizada.
 * @throws  {Error} Si la petición falla.
 */
const updateReview = async (id, updateData) => {
    try {
        const response = await api.put(REVIEW_ENDPOINTS.UPDATE_REVIEW(id), updateData);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

/**
 * @desc    Elimina una reseña.
 * @param   {string} id - ID de la reseña a eliminar.
 * @returns {Promise<Object>} Mensaje de éxito.
 * @throws  {Error} Si la petición falla.
 */
const deleteReview = async (id) => {
    try {
        const response = await api.delete(REVIEW_ENDPOINTS.DELETE_REVIEW(id));
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

const reviewService = {
    createReview,
    getBarberReviews,
    updateReview,
    deleteReview,
};

export default reviewService;
