// backend/src/models/Barber.js
const mongoose = require('mongoose');

const BarberSchema = new mongoose.Schema({
    // Reference to the User who owns this barber profile
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // A user can only have one barber profile
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        unique: true, // Each barbershop name should be unique
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    phone: { // Barbershop phone number, distinct from owner's personal phone
        type: String,
        trim: true,
        required: [true, 'Barbershop phone number is required'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    profileImage: {
        type: String, // URL to the barbershop's main image
        default: 'https://placehold.co/600x400/FFF/000?text=Barber+Shop',
    },
    photos: [{ // Array of URLs for additional photos
        type: String,
    }],
    // Geographical coordinates for location-based searches (GeoJSON Point)
    location: {
        type: {
            type: String,
            enum: ['Point'], // Must be 'Point'
            default: 'Point',
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]
            required: true,
            index: '2dsphere', // Create a 2dsphere index for geospatial queries
        },
    },
    // References to services offered by this barber/barbershop
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    // Reference to the availability schedule for this barber
    availability: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Availability',
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    // Status for admin approval (e.g., 'pending', 'approved', 'rejected')
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
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
BarberSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Barber = mongoose.model('Barber', BarberSchema);

module.exports = Barber;
