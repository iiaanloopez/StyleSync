// backend/src/models/Availability.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    // Reference to the Barber this availability belongs to
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true,
        unique: true, // Each barber has only one availability schedule
    },
    // Schedule for each day of the week
    // Example structure:
    // {
    //   "Monday": [{ start: "09:00", end: "17:00", breaks: [{ start: "12:00", end: "13:00" }] }],
    //   "Tuesday": [{ start: "09:00", end: "18:00" }],
    //   "Wednesday": [], // Day off
    //   ...
    // }
    schedule: {
        type: Map, // Use Map to store days as keys (e.g., "Monday")
        of: [{ // Each day can have multiple work blocks
            start: { type: String, required: true }, // "HH:MM"
            end: { type: String, required: true },   // "HH:MM"
            breaks: [{ // Optional breaks within a work block
                start: { type: String }, // "HH:MM"
                end: { type: String },   // "HH:MM"
            }]
        }],
        default: { // Default empty schedule
            "Monday": [], "Tuesday": [], "Wednesday": [],
            "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
        }
    },
    // Optional: Override specific dates (e.g., holidays, special events)
    // Example: [{ date: "2025-12-25", isAvailable: false, reason: "Christmas" }]
    specialDates: [{
        date: { type: Date, required: true },
        isAvailable: { type: Boolean, required: true }, // true for special opening, false for closing
        reason: { type: String, trim: true },
        startTime: { type: String }, // For special openings
        endTime: { type: String },   // For special openings
    }],
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
AvailabilitySchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Availability = mongoose.model('Availability', AvailabilitySchema);

module.exports = Availability;
