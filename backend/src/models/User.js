// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    // Field to differentiate user types: 'client', 'barber', 'admin'
    role: {
        type: String,
        enum: ['client', 'barber', 'admin'], // Only allows these roles
        default: 'client', // By default, a new user is a client
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Each email must be unique
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'], // Email format validation
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
        type: String,
        trim: true,
        // You can add a regex for phone number format validation if desired
    },
    profilePicture: {
        type: String, // URL to the profile image
        default: 'https://via.placeholder.com/150', // Default profile image
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

// Mongoose middleware: Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Only hash if the password has been modified
        next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a "salt" (random value)
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
});

// Instance method: Compare the entered password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update the 'updatedAt' field on each update operation (pre-findOneAndUpdate)
UserSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
