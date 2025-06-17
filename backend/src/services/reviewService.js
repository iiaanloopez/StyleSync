// backend/src/services/reviewService.js
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * @desc    Crea una nueva reseña.
 * @param   {string} clientId - ID del cliente que deja la reseña.
 * @param   {Object} reviewData - Datos de la reseña (barberId, bookingId, rating, comment).
 * @returns {Object} La reseña creada.
 * @throws  {Error} Si la reserva no es válida, ya existe una reseña, o los datos son inválidos.
 */
const createReview = async (clientId, reviewData) => {
    try {
        const { barberId, bookingId, rating, comment } = reviewData;

        // 1. Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5 stars.');
        }

        // 2. Ensure the booking exists and belongs to the client
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.client.toString() !== clientId.toString()) {
            throw new Error('Booking not found or you do not have permission to review it.');
        }

        // 3. Ensure the booking is completed to leave a review
        if (booking.status !== 'completed') {
            throw new Error('You can only leave reviews for completed bookings.');
        }

        // 4. Ensure no previous review for this booking by this client
        const existingReview = await Review.findOne({ booking: bookingId, client: clientId });
        if (existingReview) {
            throw new Error('You have already left a review for this booking.');
        }

        // 5. Ensure the barber exists
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found.');
        }

        // Create the new review
        const review = await Review.create({
            client: clientId,
            barber: barberId,
            booking: bookingId,
            rating,
            comment,
        });

        // Recalculate and update the barber's average rating (handled by pre/post save hooks on Review model)
        // Or you can call Review.getAverageRating(barberId) here explicitly if not using hooks

        return review;
    } catch (error) {
        console.error('Error in createReview service:', error.message);
        throw new Error(`Could not create review: ${error.message}`);
    }
};

/**
 * @desc    Obtiene todas las reseñas para un barbero/barbería específica.
 * @param   {string} barberId - ID del barbero.
 * @returns {Array<Object>} Lista de reseñas.
 * @throws  {Error} Si el barbero no es encontrado.
 */
const getBarberReviews = async (barberId) => {
    try {
        const barber = await Barber.findById(barberId);
        if (!barber) {
            throw new Error('Barber not found.');
        }

        const reviews = await Review.find({ barber: barberId })
            .populate('client', 'name profilePicture') // Only client's name and profile picture
            .sort({ createdAt: -1 }); // Sort by most recent first

        return reviews;
    } catch (error) {
        console.error('Error in getBarberReviews service:', error.message);
        throw new Error(`Could not retrieve barber reviews: ${error.message}`);
    }
};

/**
 * @desc    Actualiza una reseña existente.
 * @param   {string} reviewId - ID de la reseña a actualizar.
 * @param   {string} clientId - ID del cliente (autor de la reseña).
 * @param   {Object} updateData - Datos para actualizar (rating, comment).
 * @returns {Object} La reseña actualizada.
 * @throws  {Error} Si la reseña no es encontrada o el cliente no está autorizado.
 */
const updateReview = async (reviewId, clientId, updateData) => {
    try {
        const { rating, comment } = updateData;

        if (rating && (rating < 1 || rating > 5)) {
            throw new Error('Rating must be between 1 and 5 stars.');
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new Error('Review not found.');
        }

        if (review.client.toString() !== clientId.toString()) {
            throw new Error('Unauthorized to update this review.');
        }

        review.rating = rating !== undefined ? rating : review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        await review.save();

        // Recalculate average rating for the barber (handled by pre/post save hooks on Review model)
        // Or call Review.getAverageRating(review.barber) explicitly

        return review;
    } catch (error) {
        console.error('Error in updateReview service:', error.message);
        throw new Error(`Could not update review: ${error.message}`);
    }
};

/**
 * @desc    Elimina una reseña.
 * @param   {string} reviewId - ID de la reseña a eliminar.
 * @param   {string} userId - ID del usuario que intenta eliminar (cliente o admin).
 * @param   {string} userRole - Rol del usuario.
 * @returns {Object} Mensaje de éxito.
 * @throws  {Error} Si la reseña no es encontrada o el usuario no está autorizado.
 */
const deleteReview = async (reviewId, userId, userRole) => {
    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw new Error('Review not found.');
        }

        const isAuthor = review.client.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            throw new Error('Unauthorized to delete this review.');
        }

        // Remove the review
        await review.remove();

        // Recalculate average rating for the barber (handled by pre/post remove hooks on Review model)
        // Or call Review.getAverageRating(review.barber) explicitly

        return { message: 'Review deleted successfully.' };
    } catch (error) {
        console.error('Error in deleteReview service:', error.message);
        throw new Error(`Could not delete review: ${error.message}`);
    }
};

module.exports = {
    createReview,
    getBarberReviews,
    updateReview,
    deleteReview,
};
