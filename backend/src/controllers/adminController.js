// backend/src/controllers/adminController.js
const User = require('../models/User');
const Barber = require('../models/Barber');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

/**
 * @desc    Obtener todos los usuarios (clientes, barberos, admins)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
    try {
        // Excluir la contraseña de la respuesta
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener un usuario por ID (cliente, barbero, admin)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password'); // Excluir contraseña

        if (!user) {
            res.status(404);
            throw new Error('Usuario no encontrado.');
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar un usuario (rol, estado, etc.)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, phone, profilePicture } = req.body; // No permitir cambiar la contraseña directamente aquí

        const user = await User.findById(id);

        if (!user) {
            res.status(404);
            throw new Error('Usuario no encontrado.');
        }

        // Actualizar solo los campos permitidos
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.profilePicture = profilePicture || user.profilePicture;

        // Validar y cambiar el rol si se proporciona
        if (role && ['client', 'barber', 'admin'].includes(role)) {
            user.role = role;
        } else if (role && !['client', 'barber', 'admin'].includes(role)) {
            res.status(400);
            throw new Error('Rol de usuario inválido.');
        }

        await user.save(); // El pre-save hook de User se encargará de actualizar updatedAt

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente.',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Eliminar un usuario
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            res.status(404);
            throw new Error('Usuario no encontrado.');
        }

        // Proteger la eliminación del propio administrador o de otros administradores si es necesario
        // if (req.user._id.toString() === id.toString() || user.role === 'admin') {
        //     res.status(403);
        //     throw new Error('No autorizado para eliminar este usuario.');
        // }

        // Si es un barbero, eliminar su perfil de barbero, servicios y disponibilidad
        if (user.role === 'barber') {
            const barberProfile = await Barber.findOne({ user: id });
            if (barberProfile) {
                await Service.deleteMany({ barber: barberProfile._id }); // Eliminar servicios del barbero
                await Availability.deleteOne({ barber: barberProfile._id }); // Eliminar disponibilidad
                await barberProfile.remove(); // Eliminar perfil de barbero
            }
        }

        // Eliminar todas las reservas y reseñas asociadas a este usuario (sea cliente o barbero)
        await Booking.deleteMany({ $or: [{ client: id }, { barber: user.role === 'barber' ? user._id : null }] }); // Cuidado con barber:null
        await Review.deleteMany({ $or: [{ client: id }, { barber: user.role === 'barber' ? user._id : null }] });

        await user.remove(); // Eliminar el usuario

        res.status(200).json({
            success: true,
            message: 'Usuario y todos sus datos relacionados eliminados exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener todas las barberías (pendientes de aprobación, aprobadas, etc.)
 * @route   GET /api/admin/barbershops
 * @access  Private (Admin)
 * @query   status (ej. 'pending', 'approved')
 */
const getAllBarbershops = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }

        const barbershops = await Barber.find(query)
            .populate('user', 'name email phone') // Info básica del usuario asociado
            .populate('services') // Servicios ofrecidos
            .sort({ createdAt: -1 }); // Las más recientes primero

        res.status(200).json({
            success: true,
            count: barbershops.length,
            data: barbershops,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Aprobar o rechazar una barbería
 * @route   PUT /api/admin/barbershops/:id/status
 * @access  Private (Admin)
 */
const updateBarbershopStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved', 'rejected', 'pending'

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            res.status(400);
            throw new Error('Estado de barbería inválido.');
        }

        const barber = await Barber.findById(id);
        if (!barber) {
            res.status(404);
            throw new Error('Barbería no encontrada.');
        }

        barber.status = status;
        await barber.save();

        // Opcional: Notificar al barbero sobre el cambio de estado de su barbería
        /*
        const barberUser = await User.findById(barber.user);
        await sendEmail({
            to: barberUser.email,
            subject: `Estado de tu Barbería: ${status.toUpperCase()}`,
            text: `El estado de tu barbería ${barber.shopName} ha sido actualizado a: ${status}.`
        });
        */

        res.status(200).json({
            success: true,
            message: `Estado de la barbería actualizado a "${status}".`,
            data: barber,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener todas las reservas del sistema
 * @route   GET /api/admin/bookings
 * @access  Private (Admin)
 * @query   status (ej. 'pending', 'completed', 'cancelled')
 */
const getAllBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('client', 'name email phone')
            .populate('barber', 'shopName address')
            .populate('service', 'name price duration')
            .sort({ date: -1 }); // Las más recientes primero

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
 * @desc    Moderar/Eliminar una reseña
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private (Admin)
 */
const moderateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            res.status(404);
            throw new Error('Reseña no encontrada.');
        }

        // No se necesita verificación de rol aquí, ya que el middleware `adminProtect`
        // asegurará que solo un admin pueda acceder a esta ruta.

        await review.remove();

        // Recalcular la calificación promedio del barbero
        const barber = await Barber.findById(review.barber);
        if (barber) {
            const barberReviews = await Review.find({ barber: review.barber });
            if (barberReviews.length > 0) {
                const totalRating = barberReviews.reduce((acc, item) => item.rating + acc, 0);
                barber.averageRating = totalRating / barberReviews.length;
            } else {
                barber.averageRating = 0;
            }
            barber.numReviews = barberReviews.length;
            await barber.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada por el administrador exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllBarbershops,
    updateBarbershopStatus,
    getAllBookings,
    moderateReview,
};
