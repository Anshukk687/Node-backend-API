const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CartItem', CartSchema);