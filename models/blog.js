const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: Boolean,
    default: false
  },
  published_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
