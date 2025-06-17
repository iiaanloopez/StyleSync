// backend/src/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    // Reference to the Barber/Barbershop offering this service
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    duration: { // Duration in minutes
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
    },
    isActive: {
        type: Boolean,
        default: true, // Whether the service is currently offered
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the 'updatedAt' field on each update operation
ServiceSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
