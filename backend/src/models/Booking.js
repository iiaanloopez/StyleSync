// backend/src/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    // Reference to the client (user) who made the booking
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
    },
    // Reference to the barber/barbershop for whom the booking is made
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber', // Refers to the Barber model
        required: true,
    },
    // Reference to the specific service booked
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service', // Refers to the Service model
        required: true,
    },
    date: {
        type: Date, // Stores the full date and time of the appointment
        required: [true, 'Booking date and time are required'],
    },
    duration: {
        type: Number, // Duration of the service in minutes (copied from Service for record)
        required: true,
    },
    price: {
        type: Number, // Price of the service (copied from Service for record)
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'], // Booking lifecycle
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },
    paymentId: { // Optional: Stripe/PayPal transaction ID
        type: String,
    },
    // Optional: Notes from client or barber
    notes: {
        type: String,
        trim: true,
        maxlength: [250, 'Notes cannot be more than 250 characters'],
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
BookingSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
