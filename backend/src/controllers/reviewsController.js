// backend/src/controllers/reviewsController.js
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const Booking = require('../models/Booking'); // Para verificar si se puede dejar reseña

/**
 * @desc    Crear una nueva reseña para un barbero/barbería
 * @route   POST /api/reviews
 * @access  Private (Client)
 */
const createReview = async (req, res, next) => {
    try {
        const userId = req.user._id; // ID del cliente autenticado
        const { barberId, bookingId, rating, comment } = req.body;

        // Validar rating
        if (rating < 1 || rating > 5) {
            res.status(400);
            throw new Error('La calificación debe ser entre 1 y 5 estrellas.');
        }

        // 1. Asegurarse de que la reserva existe y pertenece al cliente
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.client.toString() !== userId.toString()) {
            res.status(404);
            throw new Error('Reserva no encontrada o no tienes permisos para dejar reseña sobre ella.');
        }

        // 2. Asegurarse de que la reserva ya esté completada para poder dejar reseña
        if (booking.status !== 'completed') {
            res.status(400);
            throw new Error('Solo puedes dejar reseñas de reservas completadas.');
        }

        // 3. Asegurarse de que no haya una reseña previa para esta misma reserva
        const existingReview = await Review.findOne({ booking: bookingId, client: userId });
        if (existingReview) {
            res.status(400);
            throw new Error('Ya has dejado una reseña para esta reserva.');
        }

        // 4. Asegurarse de que el barbero existe
        const barber = await Barber.findById(barberId);
        if (!barber) {
            res.status(404);
            throw new Error('Barbero no encontrado.');
        }

        // Crear la nueva reseña
        const review = await Review.create({
            client: userId,
            barber: barberId,
            booking: bookingId,
            rating,
            comment,
        });

        // Opcional: Actualizar la calificación promedio del barbero
        const barberReviews = await Review.find({ barber: barberId });
        const totalRating = barberReviews.reduce((acc, item) => item.rating + acc, 0);
        barber.averageRating = totalRating / barberReviews.length;
        barber.numReviews = barberReviews.length;
        await barber.save();


        res.status(201).json({
            success: true,
            message: 'Reseña creada exitosamente.',
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener todas las reseñas para un barbero/barbería específica
 * @route   GET /api/reviews/:barberId
 * @access  Public
 */
const getBarberReviews = async (req, res, next) => {
    try {
        const { barberId } = req.params;

        // Verificar que el barbero existe
        const barber = await Barber.findById(barberId);
        if (!barber) {
            res.status(404);
            throw new Error('Barbero no encontrado.');
        }

        // Obtener todas las reseñas para ese barbero, poblando la información del cliente
        const reviews = await Review.find({ barber: barberId })
            .populate('client', 'name profilePicture') // Solo nombre e imagen del cliente
            .sort({ createdAt: -1 }); // Ordenar por las más recientes primero

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar una reseña (solo el autor de la reseña)
 * @route   PUT /api/reviews/:id
 * @access  Private (Client - owner of review)
 */
const updateReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Validar rating si se proporciona
        if (rating && (rating < 1 || rating > 5)) {
            res.status(400);
            throw new Error('La calificación debe ser entre 1 y 5 estrellas.');
        }

        // Buscar la reseña
        const review = await Review.findById(id);

        if (!review) {
            res.status(404);
            throw new Error('Reseña no encontrada.');
        }

        // Verificar que el usuario autenticado es el autor de la reseña
        if (review.client.toString() !== userId.toString()) {
            res.status(403); // Forbidden
            throw new Error('No autorizado para actualizar esta reseña.');
        }

        // Actualizar campos
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Opcional: Recalcular la calificación promedio del barbero si el rating cambió
        const barberReviews = await Review.find({ barber: review.barber });
        const totalRating = barberReviews.reduce((acc, item) => item.rating + acc, 0);
        const barber = await Barber.findById(review.barber);
        barber.averageRating = totalRating / barberReviews.length;
        await barber.save();

        res.status(200).json({
            success: true,
            message: 'Reseña actualizada exitosamente.',
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Eliminar una reseña (solo el autor o un administrador)
 * @route   DELETE /api/reviews/:id
 * @access  Private (Client - owner of review, Admin)
 */
const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            res.status(404);
            throw new Error('Reseña no encontrada.');
        }

        // Verificar permisos: el autor de la reseña o un administrador
        const isAuthor = review.client.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            res.status(403);
            throw new Error('No autorizado para eliminar esta reseña.');
        }

        // Eliminar la reseña
        await review.remove();

        // Opcional: Recalcular la calificación promedio del barbero
        const barber = await Barber.findById(review.barber);
        if (barber) {
            const barberReviews = await Review.find({ barber: review.barber });
            if (barberReviews.length > 0) {
                const totalRating = barberReviews.reduce((acc, item) => item.rating + acc, 0);
                barber.averageRating = totalRating / barberReviews.length;
            } else {
                barber.averageRating = 0; // Si no hay más reseñas, la calificación promedio es 0
            }
            barber.numReviews = barberReviews.length;
            await barber.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getBarberReviews,
    updateReview,
    deleteReview,
};
