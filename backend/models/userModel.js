const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Ab sirf single name field rahega
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    restrictedUntil: {
        type: Date,
        default: null
    },
    resetOtp: {
        type: String,
        default: ''
    },
    otpExpire: {
        type: Date,
        default: null
    },
    // Cart logic agar aap database mein save karna chahte hain
    cartData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true // Isse createdAt aur updatedAt khud ban jayenge
});

// Model Export logic: Check if model already exists to prevent overwrite error
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;