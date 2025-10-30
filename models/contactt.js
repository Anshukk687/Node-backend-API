const mongoose = require('mongoose');

const contacttSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false
    },
    description: {
        type: String,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Contactt', contacttSchema);