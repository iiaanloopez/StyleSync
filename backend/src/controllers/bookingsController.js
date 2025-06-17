// backend/src/controllers/bookingsController.js
const Booking = require('../models/Booking');
const Barber = require('../models/Barber');
const User = require('../models/User');
const Service = require('../models/Service');
// const { sendEmail } = require('../utils/emailSender'); // Se usará para notificaciones

/**
 * @desc    Crear una nueva reserva
 * @route   POST /api/bookings
 * @access  Private (Client)
 */
const createBooking = async (req, res, next) => {
    try {
        const userId = req.user._id; // ID del cliente autenticado
        const { barberId, serviceId, date, time } = req.body;

        // Validar que los IDs existan y sean válidos
        const barber = await Barber.findById(barberId).populate('user', 'email');
        if (!barber) {
            res.status(404);
            throw new Error('Barbero no encontrado.');
        }
        const service = await Service.findById(serviceId);
        if (!service || service.barber.toString() !== barberId) {
            res.status(404);
            throw new Error('Servicio no encontrado o no pertenece a este barbero.');
        }

        // Convertir date y time a un objeto Date para almacenamiento y comparación
        const bookingDateTime = new Date(`${date}T${time}:00`);

        // Verificar disponibilidad del barbero (lógica simplificada, podría ser más compleja)
        // Esto debería comprobar si la franja horaria ya está ocupada para ese barbero
        const existingBooking = await Booking.findOne({
            barber: barberId,
            date: bookingDateTime, // Asume que 'date' en Booking es un Date con fecha y hora
            status: { $in: ['confirmed', 'pending'] } // Evitar duplicar reservas en estado activo
        });

        if (existingBooking) {
            res.status(400);
            throw new Error('Esa franja horaria ya está reservada para este barbero.');
        }

        // Crear la reserva
        const booking = await Booking.create({
            client: userId,
            barber: barberId,
            service: serviceId,
            date: bookingDateTime,
            duration: service.duration, // Duración del servicio en minutos
            price: service.price,
            status: 'pending', // Podría ser 'confirmed' directamente o requerir aprobación del barbero
        });

        // Opcional: Enviar notificación al cliente y al barbero
        /*
        await sendEmail({
            to: req.user.email, // Email del cliente
            subject: 'Confirmación de Reserva',
            text: `Tu reserva con ${barber.user.name} para el servicio ${service.name} el ${bookingDateTime.toLocaleString()} ha sido creada. Estado: ${booking.status}.`
        });
        await sendEmail({
            to: barber.user.email, // Email del barbero
            subject: 'Nueva Reserva Recibida',
            text: `Tienes una nueva reserva de ${req.user.name} para el servicio ${service.name} el ${bookingDateTime.toLocaleString()}. Estado: ${booking.status}.`
        });
        */

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente.',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener las reservas de un usuario (cliente o barbero)
 * @route   GET /api/bookings/me
 * @access  Private (Client, Barber)
 * @query   status (ej. 'upcoming', 'past')
 */
const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { status } = req.query; // 'upcoming', 'past', 'cancelled', 'completed'

        let query = {};

        if (userRole === 'client') {
            query.client = userId;
        } else if (userRole === 'barber') {
            // Encontrar el perfil de barbero asociado a este user ID
            const barberProfile = await Barber.findOne({ user: userId });
            if (!barberProfile) {
                res.status(404);
                throw new Error('Perfil de barbero no encontrado.');
            }
            query.barber = barberProfile._id;
        } else { // Admin puede obtener todas las reservas, pero esta ruta es solo para 'me'
            res.status(403);
            throw new Error('No autorizado para ver estas reservas.');
        }

        // Filtrar por estado y fecha
        const now = new Date();
        if (status === 'upcoming') {
            query.date = { $gte: now }; // Fecha de la reserva es igual o posterior a ahora
            query.status = { $in: ['pending', 'confirmed'] };
        } else if (status === 'past') {
            query.date = { $lt: now }; // Fecha de la reserva es anterior a ahora
            query.status = { $in: ['confirmed', 'completed', 'cancelled'] }; // Incluye canceladas para historial
        } else if (status === 'cancelled') {
            query.status = 'cancelled';
        } else if (status === 'completed') {
            query.status = 'completed';
        } else {
            // Si no se especifica estado, obtén todas las activas
            query.status = { $in: ['pending', 'confirmed', 'completed', 'cancelled'] };
        }

        const bookings = await Booking.find(query)
            .populate('client', 'name email phone profilePicture')
            .populate('barber', 'shopName address') // Solo algunos campos del barbero
            .populate('service', 'name price duration') // Información del servicio
            .sort({ date: 1 }); // Ordenar por fecha ascendente

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener una reserva específica por ID
 * @route   GET /api/bookings/:id
 * @access  Private (Client o Barber que le pertenece la reserva, o Admin)
 */
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const booking = await Booking.findById(id)
            .populate('client', 'name email phone profilePicture')
            .populate('barber', 'shopName address')
            .populate('service', 'name price duration');

        if (!booking) {
            res.status(404);
            throw new Error('Reserva no encontrada.');
        }

        // Verificar si el usuario actual es el cliente, el barbero o un administrador de la reserva
        const isClient = booking.client._id.toString() === userId.toString();
        const barberProfile = await Barber.findOne({ user: userId });
        const isBarber = barberProfile && booking.barber._id.toString() === barberProfile._id.toString();
        const isAdmin = userRole === 'admin';

        if (!isClient && !isBarber && !isAdmin) {
            res.status(403); // Forbidden
            throw new Error('No autorizado para ver esta reserva.');
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar el estado de una reserva (ej. confirmar, completar, cancelar por barbero)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Barber, Admin)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Nuevo estado (ej: 'confirmed', 'completed', 'cancelled')
        const userId = req.user._id;
        const userRole = req.user.role;

        const booking = await Booking.findById(id).populate('barber', 'user');

        if (!booking) {
            res.status(404);
            throw new Error('Reserva no encontrada.');
        }

        // Solo el barbero asociado o un administrador pueden cambiar el estado
        const barberProfile = await Barber.findOne({ user: userId });
        const isAssociatedBarber = barberProfile && booking.barber.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isAssociatedBarber && !isAdmin) {
            res.status(403);
            throw new Error('No autorizado para actualizar el estado de esta reserva.');
        }

        // Validar el nuevo estado (ej. no se puede pasar de 'completed' a 'pending')
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400);
            throw new Error('Estado de reserva inválido.');
        }

        // Lógica de transición de estados si es necesaria (ej: no permitir cancelar una cita ya completada)
        if (booking.status === 'completed' && status !== 'completed') {
            res.status(400);
            throw new Error('No se puede cambiar el estado de una reserva ya completada.');
        }

        booking.status = status;
        await booking.save();

        // Opcional: Enviar notificación al cliente sobre el cambio de estado
        /*
        const client = await User.findById(booking.client);
        await sendEmail({
            to: client.email,
            subject: `Actualización de tu Reserva: ${status.toUpperCase()}`,
            text: `Tu reserva para el ${booking.date.toLocaleString()} con ${booking.barber.shopName} ahora está ${status}.`
        });
        */

        res.status(200).json({
            success: true,
            message: `Estado de reserva actualizado a "${status}".`,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reprogramar una reserva
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private (Client)
 */
const rescheduleBooking = async (req, res, next) => {
    try {
        const userId = req.user._id; // ID del cliente
        const { id } = req.params;
        const { newDate, newTime } = req.body; // Nuevos valores de fecha y hora

        const booking = await Booking.findById(id).populate('barber', 'user');

        if (!booking) {
            res.status(404);
            throw new Error('Reserva no encontrada.');
        }

        // Solo el cliente original puede reprogramar su propia reserva
        if (booking.client.toString() !== userId.toString()) {
            res.status(403);
            throw new Error('No autorizado para reprogramar esta reserva.');
        }

        // Verificar que la reserva no esté ya completada o cancelada
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            res.status(400);
            throw new Error('No se puede reprogramar una reserva que ya ha sido completada o cancelada.');
        }

        const newBookingDateTime = new Date(`${newDate}T${newTime}:00`);

        // Verificar que la nueva fecha/hora sea en el futuro
        if (newBookingDateTime <= new Date()) {
            res.status(400);
            throw new Error('La nueva fecha y hora deben ser en el futuro.');
        }

        // Verificar disponibilidad del barbero en la nueva franja (similar a createBooking)
        const existingBooking = await Booking.findOne({
            barber: booking.barber._id,
            date: newBookingDateTime,
            status: { $in: ['confirmed', 'pending'] }
        });

        if (existingBooking) {
            res.status(400);
            throw new Error('La nueva franja horaria ya está reservada para este barbero.');
        }

        // Actualizar la fecha y hora de la reserva
        booking.date = newBookingDateTime;
        booking.status = 'pending'; // Opcional: volver a estado pendiente tras reprogramación
        await booking.save();

        // Opcional: Notificar al barbero y al cliente
        /*
        const barberUser = await User.findById(booking.barber.user);
        await sendEmail({
            to: barberUser.email,
            subject: 'Reserva Reprogramada',
            text: `La reserva del cliente ${req.user.name} ha sido reprogramada para el ${newBookingDateTime.toLocaleString()}.`
        });
        await sendEmail({
            to: req.user.email,
            subject: 'Tu Reserva Ha Sido Reprogramada',
            text: `Tu reserva ha sido reprogramada exitosamente para el ${newBookingDateTime.toLocaleString()}.`
        });
        */

        res.status(200).json({
            success: true,
            message: 'Reserva reprogramada exitosamente.',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancelar una reserva
 * @route   DELETE /api/bookings/:id
 * @access  Private (Client que le pertenece la reserva, o Barber asociado, o Admin)
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const booking = await Booking.findById(id).populate('barber', 'user');

        if (!booking) {
            res.status(404);
            throw new Error('Reserva no encontrada.');
        }

        // Permitir cancelar si es el cliente, el barbero asociado o un administrador
        const isClient = booking.client.toString() === userId.toString();
        const barberProfile = await Barber.findOne({ user: userId });
        const isAssociatedBarber = barberProfile && booking.barber.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isClient && !isAssociatedBarber && !isAdmin) {
            res.status(403);
            throw new Error('No autorizado para cancelar esta reserva.');
        }

        // Verificar que la reserva no esté ya completada
        if (booking.status === 'completed') {
            res.status(400);
            throw new Error('No se puede cancelar una reserva ya completada.');
        }

        booking.status = 'cancelled';
        await booking.save();

        // Opcional: Notificar a las partes involucradas
        /*
        const client = await User.findById(booking.client);
        const barberUser = await User.findById(booking.barber.user);
        await sendEmail({
            to: client.email,
            subject: 'Tu Reserva Ha Sido Cancelada',
            text: `Tu reserva para el ${booking.date.toLocaleString()} ha sido cancelada.`
        });
        await sendEmail({
            to: barberUser.email,
            subject: 'Reserva Cancelada',
            text: `La reserva del cliente ${client.name} para el ${booking.date.toLocaleString()} ha sido cancelada.`
        });
        */

        res.status(200).json({
            success: true,
            message: 'Reserva cancelada exitosamente.',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
};
