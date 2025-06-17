// backend/src/services/barberService.js
const Barber = require('../models/Barber');
const User = require('../models/User');
const Service = require('../models/Service');
const Availability = require('../models/Availability');

/**
 * @desc    Obtiene todos los barberos/barberías con filtros opcionales.
 * @param   {Object} filters - Objeto con filtros (ej. location, serviceId).
 * @returns {Array<Object>} Lista de barberos.
 * @throws  {Error} Si ocurre un error en la base de datos.
 */
const getAllBarbers = async (filters = {}) => {
    try {
        let query = {};
        const { location, serviceId } = filters;

        if (location) {
            query.address = { $regex: location, $options: 'i' };
        }
        if (serviceId) {
            query.services = serviceId; // Filtra por ID de servicio
        }

        const barbers = await Barber.find(query)
            .populate('user', 'name email profilePicture')
            .populate('services');

        return barbers;
    } catch (error) {
        console.error('Error in getAllBarbers service:', error.message);
        throw new Error('Could not retrieve barbers. Please try again later.');
    }
};

/**
 * @desc    Obtiene un barbero/barbería por su ID.
 * @param   {string} barberId - El ID del barbero.
 * @returns {Object} El objeto barbero.
 * @throws  {Error} Si el barbero no es encontrado.
 */
const getBarberById = async (barberId) => {
    try {
        const barber = await Barber.findById(barberId)
            .populate('user', 'name email phone profilePicture')
            .populate('services')
            .populate('availability');

        if (!barber) {
            throw new Error('Barber not found.');
        }
        return barber;
    } catch (error) {
        console.error('Error in getBarberById service:', error.message);
        throw new Error('Could not retrieve barber details. Please try again later.');
    }
};

/**
 * @desc    Crea o actualiza el perfil de un barbero.
 * @param   {string} userId - ID del usuario asociado al barbero.
 * @param   {Object} profileData - Datos del perfil del barbero (shopName, address, etc.).
 * @param   {string} [profileImage] - URL de la imagen de perfil (opcional).
 * @returns {Object} El perfil del barbero actualizado o creado.
 * @throws  {Error} Si el usuario no es encontrado o los datos son inválidos.
 */
const createOrUpdateBarberProfile = async (userId, profileData, profileImage = null) => {
    try {
        const { shopName, address, description, coordinates, phone } = profileData;

        let barber = await Barber.findOne({ user: userId });

        const updateFields = {
            shopName,
            address,
            description,
            phone,
            updatedAt: Date.now()
        };

        if (coordinates && coordinates.length === 2) {
            updateFields.location = {
                type: 'Point',
                coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
            };
        }
        if (profileImage) {
            updateFields.profileImage = profileImage;
        }

        if (barber) {
            // Update existing profile
            Object.assign(barber, updateFields);
            await barber.save();
        } else {
            // Create new profile
            barber = await Barber.create({
                user: userId,
                ...updateFields
            });
            // Also update the user's role to 'barber' if it was 'client' (e.g., if a client decides to register as a barber)
            const user = await User.findById(userId);
            if (user && user.role === 'client') {
                user.role = 'barber';
                await user.save();
            }
        }
        return barber;
    } catch (error) {
        console.error('Error in createOrUpdateBarberProfile service:', error.message);
        throw new Error('Could not create or update barber profile.');
    }
};

/**
 * @desc    Añade un nuevo servicio a un barbero.
 * @param   {string} userId - ID del usuario barbero.
 * @param   {Object} serviceData - Datos del servicio (name, price, duration, description).
 * @returns {Object} El servicio creado.
 * @throws  {Error} Si el perfil de barbero no es encontrado o los datos son inválidos.
 */
const addService = async (userId, serviceData) => {
    try {
        const { name, price, duration, description } = serviceData;

        const barber = await Barber.findOne({ user: userId });
        if (!barber) {
            throw new Error('Barber profile not found.');
        }

        const service = await Service.create({
            barber: barber._id,
            name,
            price,
            duration,
            description
        });

        // Add service reference to barber's services array
        barber.services.push(service._id);
        await barber.save();

        return service;
    } catch (error) {
        console.error('Error in addService service:', error.message);
        throw new Error('Could not add service.');
    }
};

/**
 * @desc    Actualiza un servicio existente de un barbero.
 * @param   {string} serviceId - ID del servicio a actualizar.
 * @param   {string} userId - ID del usuario barbero.
 * @param   {Object} updateData - Datos para actualizar el servicio.
 * @returns {Object} El servicio actualizado.
 * @throws  {Error} Si el servicio no es encontrado o el usuario no está autorizado.
 */
const updateService = async (serviceId, userId, updateData) => {
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error('Service not found.');
        }

        const barber = await Barber.findOne({ user: userId });
        if (!barber || service.barber.toString() !== barber._id.toString()) {
            throw new Error('Unauthorized to update this service.');
        }

        Object.assign(service, updateData);
        await service.save();

        return service;
    } catch (error) {
        console.error('Error in updateService service:', error.message);
        throw new Error('Could not update service.');
    }
};

/**
 * @desc    Elimina un servicio de un barbero.
 * @param   {string} serviceId - ID del servicio a eliminar.
 * @param   {string} userId - ID del usuario barbero.
 * @returns {Object} Mensaje de éxito.
 * @throws  {Error} Si el servicio no es encontrado o el usuario no está autorizado.
 */
const deleteService = async (serviceId, userId) => {
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error('Service not found.');
        }

        const barber = await Barber.findOne({ user: userId });
        if (!barber || service.barber.toString() !== barber._id.toString()) {
            throw new Error('Unauthorized to delete this service.');
        }

        // Remove service from the Service collection
        await service.remove();

        // Remove reference from the barber's services array
        barber.services = barber.services.filter(s => s.toString() !== serviceId);
        await barber.save();

        return { message: 'Service deleted successfully.' };
    } catch (error) {
        console.error('Error in deleteService service:', error.message);
        throw new Error('Could not delete service.');
    }
};

/**
 * @desc    Actualiza la disponibilidad horaria de un barbero.
 * @param   {string} userId - ID del usuario barbero.
 * @param   {Object} scheduleData - Objeto con la disponibilidad (ej. { "Monday": [...] }).
 * @returns {Object} La disponibilidad actualizada.
 * @throws  {Error} Si el perfil de barbero no es encontrado.
 */
const updateAvailability = async (userId, scheduleData) => {
    try {
        const barber = await Barber.findOne({ user: userId });
        if (!barber) {
            throw new Error('Barber profile not found.');
        }

        let availability = await Availability.findOne({ barber: barber._id });

        if (availability) {
            // Update existing availability
            availability.schedule = scheduleData.schedule || availability.schedule;
            availability.specialDates = scheduleData.specialDates || availability.specialDates;
            await availability.save();
        } else {
            // Create new availability
            availability = await Availability.create({
                barber: barber._id,
                schedule: scheduleData.schedule,
                specialDates: scheduleData.specialDates
            });
        }

        // Link availability to barber (if not already in Barber model directly)
        barber.availability = availability._id;
        await barber.save();

        return availability;
    } catch (error) {
        console.error('Error in updateAvailability service:', error.message);
        throw new Error('Could not update availability.');
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
