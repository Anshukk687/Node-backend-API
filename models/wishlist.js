const mongoose = require('mongoose');

const WishSchema = new mongoose.Schema({
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
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WishList', WishSchema);