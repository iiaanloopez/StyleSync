// backend/src/controllers/barbersController.js
const Barber = require('../models/Barber');
const User = require('../models/User'); // Para poblar la información del usuario
const Service = require('../models/Service');
const Availability = require('../models/Availability'); // Para la disponibilidad del barbero
const { upload } = require('../config/storage'); // Para la subida de archivos

/**
 * @desc    Obtener todos los barberos/barberías
 * @route   GET /api/barbers
 * @access  Public
 * @query   location, service, rating (para filtrado)
 */
const getAllBarbers = async (req, res, next) => {
    try {
        const { location, service, rating } = req.query;
        let query = {};

        if (location) {
            query.address = { $regex: location, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
        }
        // Para filtrar por servicio y rating, se necesitaría más lógica de poblamiento o agregación
        // Por ahora, solo obtenemos todos y se pueden filtrar en el frontend o se expandirá aquí.

        // Poblar la información del usuario asociado al barbero y los servicios
        const barbers = await Barber.find(query)
            .populate('user', 'name email profilePicture') // Trae campos específicos del modelo User
            .populate('services'); // Trae los servicios del barbero

        res.status(200).json({
            success: true,
            count: barbers.length,
            data: barbers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener un barbero/barbería por ID
 * @route   GET /api/barbers/:id
 * @access  Public
 */
const getBarberById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Buscar el barbero por ID y poblar su usuario, servicios y disponibilidad
        const barber = await Barber.findById(id)
            .populate('user', 'name email phone profilePicture')
            .populate('services')
            .populate('availability'); // Asume que Availability está directamente en el modelo Barber

        if (!barber) {
            res.status(404);
            throw new Error('Barbero/Barbería no encontrado');
        }

        res.status(200).json({
            success: true,
            data: barber,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Crear o actualizar el perfil del barbero autenticado
 * @route   POST /api/barbers/profile
 * @access  Private (Barber)
 * @middleware upload.single('profileImage') para subir una imagen de perfil
 */
const createOrUpdateBarberProfile = async (req, res, next) => {
    try {
        // req.user viene del middleware 'protect'
        const userId = req.user._id;
        const { shopName, address, description, coordinates } = req.body; // coordinates: [longitude, latitude]
        const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null; // URL de la imagen subida

        // Verificar si el usuario ya tiene un perfil de barbero
        let barber = await Barber.findOne({ user: userId });

        if (barber) {
            // Actualizar perfil existente
            barber.shopName = shopName || barber.shopName;
            barber.address = address || barber.address;
            barber.description = description || barber.description;
            if (coordinates) {
                barber.location = {
                    type: 'Point',
                    coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
                };
            }
            if (profileImageUrl) {
                barber.profileImage = profileImageUrl;
            }
            barber.updatedAt = Date.now();
            await barber.save();
            res.status(200).json({
                success: true,
                message: 'Perfil de barbero actualizado exitosamente.',
                data: barber,
            });
        } else {
            // Crear nuevo perfil de barbero
            barber = await Barber.create({
                user: userId,
                shopName,
                address,
                description,
                profileImage: profileImageUrl,
                location: coordinates ? { type: 'Point', coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])] } : undefined
            });

            // Opcional: Si el usuario se registró como cliente y ahora crea perfil de barbero,
            // puedes actualizar su rol a 'barber' si es necesario. (Ya lo manejamos en registerBarber)
            // const user = await User.findById(userId);
            // if (user && user.role === 'client') {
            //     user.role = 'barber';
            //     await user.save();
            // }

            res.status(201).json({
                success: true,
                message: 'Perfil de barbero creado exitosamente.',
                data: barber,
            });
        }
    } catch (error) {
        // Si hay un error de Multer (ej. tipo de archivo incorrecto), Multer lo pasará a next()
        if (error instanceof multer.MulterError) {
            res.status(400); // Bad Request
            return next(new Error(`Error al subir imagen: ${error.message}`));
        }
        next(error);
    }
};


/**
 * @desc    Añadir un nuevo servicio (solo para barberos autenticados)
 * @route   POST /api/barbers/me/services
 * @access  Private (Barber)
 */
const addService = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, price, duration, description } = req.body;

        // Asegurarse de que el barbero existe
        const barber = await Barber.findOne({ user: userId });
        if (!barber) {
            res.status(404);
            throw new Error('Perfil de barbero no encontrado para añadir servicios.');
        }

        // Crear el nuevo servicio
        const service = await Service.create({
            barber: barber._id,
            name,
            price,
            duration, // Duración en minutos
            description
        });

        // Añadir el servicio al array de servicios del barbero
        barber.services.push(service._id);
        await barber.save();

        res.status(201).json({
            success: true,
            message: 'Servicio añadido exitosamente.',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar un servicio existente (solo para barberos autenticados)
 * @route   PUT /api/barbers/me/services/:serviceId
 * @access  Private (Barber)
 */
const updateService = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { serviceId } = req.params;
        const { name, price, duration, description } = req.body;

        // Buscar el servicio y verificar que pertenece al barbero autenticado
        const service = await Service.findOne({ _id: serviceId });

        if (!service) {
            res.status(404);
            throw new Error('Servicio no encontrado.');
        }

        const barber = await Barber.findOne({ user: userId });
        if (!barber || service.barber.toString() !== barber._id.toString()) {
            res.status(403); // Forbidden
            throw new Error('No autorizado para actualizar este servicio.');
        }

        service.name = name || service.name;
        service.price = price || service.price;
        service.duration = duration || service.duration;
        service.description = description || service.description;
        await service.save();

        res.status(200).json({
            success: true,
            message: 'Servicio actualizado exitosamente.',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Eliminar un servicio (solo para barberos autenticados)
 * @route   DELETE /api/barbers/me/services/:serviceId
 * @access  Private (Barber)
 */
const deleteService = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { serviceId } = req.params;

        // Buscar el servicio y verificar que pertenece al barbero autenticado
        const service = await Service.findOne({ _id: serviceId });

        if (!service) {
            res.status(404);
            throw new Error('Servicio no encontrado.');
        }

        const barber = await Barber.findOne({ user: userId });
        if (!barber || service.barber.toString() !== barber._id.toString()) {
            res.status(403); // Forbidden
            throw new Error('No autorizado para eliminar este servicio.');
        }

        // Eliminar el servicio de la colección de Servicios
        await service.remove();

        // Eliminar la referencia del servicio del array de servicios del barbero
        barber.services = barber.services.filter(s => s.toString() !== serviceId);
        await barber.save();

        res.status(200).json({
            success: true,
            message: 'Servicio eliminado exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar la disponibilidad del barbero (solo para barberos autenticados)
 * @route   PUT /api/barbers/me/availability
 * @access  Private (Barber)
 */
const updateAvailability = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { schedule } = req.body; // Ej: { "Monday": [{ start: "09:00", end: "17:00", breaks: [{ start: "12:00", end: "13:00" }] }] }

        // Asegurarse de que el barbero existe
        const barber = await Barber.findOne({ user: userId });
        if (!barber) {
            res.status(404);
            throw new Error('Perfil de barbero no encontrado.');
        }

        let availability = await Availability.findOne({ barber: barber._id });

        if (availability) {
            // Actualizar disponibilidad existente
            availability.schedule = schedule;
            await availability.save();
        } else {
            // Crear nueva disponibilidad
            availability = await Availability.create({
                barber: barber._id,
                schedule,
            });
        }

        // Vincular disponibilidad al barbero (si no está ya en el modelo Barber)
        barber.availability = availability._id;
        await barber.save();

        res.status(200).json({
            success: true,
            message: 'Disponibilidad actualizada exitosamente.',
            data: availability,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBarbers,
    getBarberById,
    createOrUpdateBarberProfile,
    addService,
    updateService,
    deleteService,
    updateAvailability,
};
