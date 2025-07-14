const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
