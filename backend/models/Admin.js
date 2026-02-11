const mongoose = require('mongoose');

// Admin Schema define kar rahe hain
const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ek email se ek hi admin ban sakega
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Isse record kab bana (createdAt) wo apne aap save ho jayega
});

module.exports = mongoose.model('Admin', AdminSchema);