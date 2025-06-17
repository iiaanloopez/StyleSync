// backend/src/services/bookingService.js
const Booking = require('../models/Booking');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const User = require('../models/User');
// const { sendEmail } = require('../utils/emailSender'); // Uncomment when emailSender is ready

/**
 * @desc    Crea una nueva reserva.
 * @param   {string} clientId - ID del cliente que hace la reserva.
 * @param   {Object} bookingData - Datos de la reserva (barberId, serviceId, date, time).
 * @returns {Object} La reserva creada.
 * @throws  {Error} Si el barbero/servicio no existe, la franja no está disponible o los datos son inválidos.
 */
const createBooking = async (clientId, bookingData) => {
    try {
        const { barberId, serviceId, date, time } = bookingData;

        // 1. Validate Barber and Service exist and are linked
        const barber = await Barber.findById(barberId).populate('user', 'email name'); // Populate user to get email for notifications
        if (!barber) {
            throw new Error('Barber not found.');
        }
        const service = await Service.findById(serviceId);
        if (!service || service.barber.toString() !== barberId) {
            throw new Error('Service not found or does not belong to this barber.');
        }

        const client = await User.findById(clientId);
        if (!client) {
            throw new Error('Client not found.');
        }

        // Combine date and time into a single Date object
        const bookingDateTime = new Date(`${date}T${time}:00`);

        // 2. Check for future date/time
        if (bookingDateTime <= new Date()) {
            throw new Error('Booking date and time must be in the future.');
        }

        // 3. Check availability (simplified - could be more complex with Availability model)
        // This checks if the exact time slot is already taken for that barber
        const existingBooking = await Booking.findOne({
            barber: barberId,
            date: bookingDateTime,
            status: { $in: ['pending', 'confirmed'] } // Only consider active bookings
        });

        if (existingBooking) {
            throw new Error('This time slot is already booked for this barber.');
        }

        // 4. Create the booking
        const booking = await Booking.create({
            client: clientId,
            barber: barberId,
            service: serviceId,
            date: bookingDateTime,
            duration: service.duration,
            price: service.price,
            status: 'pending', // Or 'confirmed' depending on your flow
            paymentStatus: 'pending' // Initial payment status
        });

        // 5. Optional: Send email notifications
        /*
        if (sendEmail) {
            await sendEmail({
                to: client.email,
                subject: 'Booking Confirmation',
                text: `Hi ${client.name},\n\nYour booking with ${barber.shopName} for ${service.name} on ${bookingDateTime.toLocaleString()} is ${booking.status}. Your booking ID is ${booking._id}.`
            });
            await sendEmail({
                to: barber.user.email,
                subject: 'New Booking Received',
                text: `Hi ${barber.user.name},\n\nYou have a new booking from ${client.name} for ${service.name} on ${bookingDateTime.toLocaleString()}. Booking ID: ${booking._id}.`
            });
        }
        */

        return booking;
    } catch (error) {
        console.error('Error in createBooking service:', error.message);
        throw new Error(`Could not create booking: ${error.message}`);
    }
};

/**
 * @desc    Obtiene las reservas de un usuario (cliente o barbero).
 * @param   {string} userId - ID del usuario.
 * @param   {string} userRole - Rol del usuario ('client' o 'barber').
 * @param   {string} [statusFilter] - Filtro de estado (ej. 'upcoming', 'past').
 * @returns {Array<Object>} Lista de reservas.
 * @throws  {Error} Si el perfil de barbero no es encontrado o el rol no es válido.
 */
const getUserBookings = async (userId, userRole, statusFilter = null) => {
    try {
        let query = {};

        if (userRole === 'client') {
            query.client = userId;
        } else if (userRole === 'barber') {
            const barberProfile = await Barber.findOne({ user: userId });
            if (!barberProfile) {
                throw new Error('Barber profile not found.');
            }
            query.barber = barberProfile._id;
        } else {
            throw new Error('Invalid user role for booking lookup.');
        }

        const now = new Date();
        if (statusFilter === 'upcoming') {
            query.date = { $gte: now };
            query.status = { $in: ['pending', 'confirmed'] };
        } else if (statusFilter === 'past') {
            query.date = { $lt: now };
            query.status = { $in: ['confirmed', 'completed', 'cancelled', 'rescheduled'] };
        } else if (statusFilter === 'cancelled') {
            query.status = 'cancelled';
        } else if (statusFilter === 'completed') {
            query.status = 'completed';
        } else if (statusFilter === 'rescheduled') {
            query.status = 'rescheduled';
        }

        const bookings = await Booking.find(query)
            .populate('client', 'name email phone profilePicture')
            .populate('barber', 'shopName address profileImage user') // Populate user inside barber for email
            .populate('service', 'name price duration')
            .sort({ date: 1 });

        return bookings;
    } catch (error) {
        console.error('Error in getUserBookings service:', error.message);
        throw new Error(`Could not retrieve user bookings: ${error.message}`);
    }
};

/**
 * @desc    Obtiene una reserva específica por ID, con verificación de permisos.
 * @param   {string} bookingId - ID de la reserva.
 * @param   {string} userId - ID del usuario que intenta acceder.
 * @param   {string} userRole - Rol del usuario.
 * @returns {Object} La reserva encontrada.
 * @throws  {Error} Si la reserva no es encontrada o el usuario no está autorizado.
 */
const getBookingById = async (bookingId, userId, userRole) => {
    try {
        const booking = await Booking.findById(bookingId)
            .populate('client', 'name email phone profilePicture')
            .populate('barber', 'shopName address profileImage user')
            .populate('service', 'name price duration');

        if (!booking) {
            throw new Error('Booking not found.');
        }

        const isClient = booking.client._id.toString() === userId.toString();
        const barberProfile = await Barber.findOne({ user: userId });
        const isBarber = barberProfile && booking.barber.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isClient && !isBarber && !isAdmin) {
            throw new Error('Unauthorized to view this booking.');
        }

        return booking;
    } catch (error) {
        console.error('Error in getBookingById service:', error.message);
        throw new Error(`Could not retrieve booking: ${error.message}`);
    }
};

/**
 * @desc    Actualiza el estado de una reserva.
 * @param   {string} bookingId - ID de la reserva.
 * @param   {string} newStatus - El nuevo estado (ej. 'confirmed', 'completed', 'cancelled').
 * @param   {string} userId - ID del usuario que realiza la acción.
 * @param   {string} userRole - Rol del usuario.
 * @returns {Object} La reserva actualizada.
 * @throws  {Error} Si la reserva no existe, el estado es inválido o el usuario no está autorizado.
 */
const updateBookingStatus = async (bookingId, newStatus, userId, userRole) => {
    try {
        const booking = await Booking.findById(bookingId).populate('barber', 'user');

        if (!booking) {
            throw new Error('Booking not found.');
        }

        const barberProfile = await Barber.findOne({ user: userId });
        const isAssociatedBarber = barberProfile && booking.barber.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isAssociatedBarber && !isAdmin) {
            throw new Error('Unauthorized to update this booking status.');
        }

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid booking status.');
        }

        // Example: Prevent changing status of a completed booking
        if (booking.status === 'completed' && newStatus !== 'completed') {
            throw new Error('Cannot change status of an already completed booking.');
        }
        // Example: Prevent changing status of a cancelled booking to active
        if (booking.status === 'cancelled' && ['pending', 'confirmed', 'rescheduled'].includes(newStatus)) {
             throw new Error('Cannot reactivate a cancelled booking.');
        }

        booking.status = newStatus;
        await booking.save();

        // Optional: Send notification to client about status change
        /*
        const client = await User.findById(booking.client);
        if (sendEmail) {
            await sendEmail({
                to: client.email,
                subject: `Your Booking Status Update: ${newStatus.toUpperCase()}`,
                text: `Your booking for ${booking.date.toLocaleString()} with ${booking.barber.shopName} is now ${newStatus}.`
            });
        }
        */

        return booking;
    } catch (error) {
        console.error('Error in updateBookingStatus service:', error.message);
        throw new Error(`Could not update booking status: ${error.message}`);
    }
};

/**
 * @desc    Reprograma una reserva.
 * @param   {string} bookingId - ID de la reserva.
 * @param   {string} clientId - ID del cliente que intenta reprogramar.
 * @param   {Object} newDateTime - Objeto con newDate y newTime.
 * @returns {Object} La reserva reprogramada.
 * @throws  {Error} Si la reserva no existe, el cliente no es el propietario, o la nueva franja no está disponible.
 */
const rescheduleBooking = async (bookingId, clientId, newDateTime) => {
    try {
        const { newDate, newTime } = newDateTime;
        const booking = await Booking.findById(bookingId).populate('barber', 'user');

        if (!booking) {
            throw new Error('Booking not found.');
        }

        if (booking.client.toString() !== clientId.toString()) {
            throw new Error('Unauthorized to reschedule this booking.');
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            throw new Error('Cannot reschedule a completed or cancelled booking.');
        }

        const newBookingDateTime = new Date(`${newDate}T${newTime}:00`);

        if (newBookingDateTime <= new Date()) {
            throw new Error('New date and time must be in the future.');
        }

        // Check availability for the new slot
        const existingBookingAtNewTime = await Booking.findOne({
            barber: booking.barber._id,
            date: newBookingDateTime,
            status: { $in: ['confirmed', 'pending'] },
            _id: { $ne: bookingId } // Exclude the current booking being rescheduled
        });

        if (existingBookingAtNewNewTime) {
            throw new Error('The new time slot is already booked for this barber.');
        }

        booking.date = newBookingDateTime;
        booking.status = 'rescheduled'; // Set status to rescheduled
        await booking.save();

        // Optional: Notify barber and client
        /*
        const barberUser = await User.findById(booking.barber.user);
        if (sendEmail) {
            await sendEmail({
                to: barberUser.email,
                subject: 'Booking Rescheduled',
                text: `Client ${client.name} has rescheduled their booking for ${newBookingDateTime.toLocaleString()}.`
            });
            await sendEmail({
                to: client.email,
                subject: 'Your Booking Has Been Rescheduled',
                text: `Your booking has been successfully rescheduled to ${newBookingDateTime.toLocaleString()}.`
            });
        }
        */

        return booking;
    } catch (error) {
        console.error('Error in rescheduleBooking service:', error.message);
        throw new Error(`Could not reschedule booking: ${error.message}`);
    }
};

/**
 * @desc    Cancela una reserva.
 * @param   {string} bookingId - ID de la reserva a cancelar.
 * @param   {string} userId - ID del usuario que intenta cancelar.
 * @param   {string} userRole - Rol del usuario.
 * @returns {Object} La reserva cancelada.
 * @throws  {Error} Si la reserva no existe o el usuario no está autorizado.
 */
const cancelBooking = async (bookingId, userId, userRole) => {
    try {
        const booking = await Booking.findById(bookingId).populate('barber', 'user');

        if (!booking) {
            throw new Error('Booking not found.');
        }

        const isClient = booking.client.toString() === userId.toString();
        const barberProfile = await Barber.findOne({ user: userId });
        const isAssociatedBarber = barberProfile && booking.barber.user.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isClient && !isAssociatedBarber && !isAdmin) {
            throw new Error('Unauthorized to cancel this booking.');
        }

        if (booking.status === 'completed') {
            throw new Error('Cannot cancel a completed booking.');
        }

        booking.status = 'cancelled';
        await booking.save();

        // Optional: Notify involved parties
        /*
        const client = await User.findById(booking.client);
        const barberUser = await User.findById(booking.barber.user);
        if (sendEmail) {
            await sendEmail({
                to: client.email,
                subject: 'Your Booking Has Been Cancelled',
                text: `Your booking for ${booking.date.toLocaleString()} has been cancelled.`
            });
            await sendEmail({
                to: barberUser.email,
                subject: 'Booking Cancelled',
                text: `Client ${client.name}'s booking for ${booking.date.toLocaleString()} has been cancelled.`
            });
        }
        */

        return booking;
    } catch (error) {
        console.error('Error in cancelBooking service:', error.message);
        throw new Error(`Could not cancel booking: ${error.message}`);
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
