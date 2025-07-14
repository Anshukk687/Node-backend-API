const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  expire_token: Date
}, { timestamps: true });

module.exports = mongoose.model('Register', registerSchema);