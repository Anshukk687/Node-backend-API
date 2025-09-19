const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    description: {
        type: String,
        default: false
    },
    token: {
        type: String,
        required: false
    },
    expire_token: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);