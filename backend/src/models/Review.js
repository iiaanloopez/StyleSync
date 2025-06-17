// backend/src/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    // Reference to the client (user) who wrote the review
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
    },
    // Reference to the barber/barbershop being reviewed
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber', // Refers to the Barber model
        required: true,
    },
    // Optional: Reference to the specific booking this review is for
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', // Refers to the Booking model
        required: true,
        unique: true, // A client can only review a specific booking once
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1 star'],
        max: [5, 'Rating cannot be more than 5 stars'],
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot be more than 500 characters'],
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
ReviewSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Optional: Recalculate barber's average rating after a review is saved or removed
// This can also be done in the controller when a review is created/updated/deleted
ReviewSchema.statics.getAverageRating = async function(barberId) {
    const obj = await this.aggregate([
        {
            $match: { barber: barberId }
        },
        {
            $group: {
                _id: '$barber',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('Barber').findByIdAndUpdate(barberId, {
            averageRating: obj[0] ? obj[0].averageRating : 0,
            numReviews: obj[0] ? obj[0].numReviews : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.barber);
});

// Call getAverageRating before remove (for update in pre('remove'))
ReviewSchema.post('remove', async function() {
    await this.constructor.getAverageRating(this.barber);
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
