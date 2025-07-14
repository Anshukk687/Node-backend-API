const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  price: { type: Number },
  stock: { type: String },
  front: { type: String},
  back: { type: String },
  side: { type: String },
  // var_images: {
  //   front: String,
  //   back: String,
  //   side: String
  // }
});

const productSchema = new mongoose.Schema({
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcat_id: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true,
  },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  brand: String,
  description: String,
  rating: Number,
  pricee: Number,
  image: String,
  variants: [productVariantSchema],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);