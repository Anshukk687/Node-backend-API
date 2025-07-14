const Category = require('../models/category');
const SubCat = require('../models/subCategory');
const Product = require('../models/product');
const mongoose = require('mongoose');

// exports.searchData = async (req, res) => {
//     try {
//         let { q } = req.query;
//         if (!q) return res.status(400).json({ message: 'Missing search query' });

//         const queries = Array.isArray(q) ? q : [q];

//         const regexTerms = [];
//         const numericTerms = [];
//         const objectIdTerms = [];

//         for (const term of queries) {
//             if (!isNaN(term)) {
//                 numericTerms.push(Number(term));
//             } else if (mongoose.Types.ObjectId.isValid(term)) {
//                 objectIdTerms.push(term);
//             } else {
//                 regexTerms.push(new RegExp(term, 'i'));
//             }
//         }

//         const productQuery = { $or: [] };

//         regexTerms.forEach(regex => {
//             productQuery.$or.push({ title: regex });
//             productQuery.$or.push({ brand: regex });
//             productQuery.$or.push({ 'variants.size': regex });
//             productQuery.$or.push({ 'variants.color': regex });
//         });

//         numericTerms.forEach(num => {
//             productQuery.$or.push({ pricee: num });
//             productQuery.$or.push({ 'variants.price': num });
//         });

//         const categories = await Category.find({ title: { $in: regexTerms } });
//         const subCategories = await SubCat.find({ title: { $in: regexTerms } });

//         const subCategoryIds = [
//             ...subCategories.map(sub => sub._id),
//             ...objectIdTerms.map(id => new mongoose.Types.ObjectId(id))
//         ];

//         console.log('SubCategory IDs:', subCategoryIds);

//         if (subCategoryIds.length > 0) {
//             productQuery.$or.push({ subCategory: { $in: subCategoryIds } });
//         }

//         const products = await Product.find(productQuery).populate('subCategory');
//         console.log('Products:', products);

//         res.status(200).json({
//             categories,
//             subCategories,
//             products
//         });
//     } catch (error) {
//         console.error('Error searching data:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };



// Search products by subcategoryId via query param ?q=

exports.searchData = async (req, res) => {
  try {
    const { id, minValue, maxValue, size, color } = req.body;

    const filter = {};

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      filter.subcat_id = new mongoose.Types.ObjectId(id);
    }

    if ((minValue || minValue === 0) || (maxValue || maxValue === 0)) {
      filter['variants.price'] = {};
      if (minValue !== undefined && minValue !== null) {
        filter['variants.price'].$gte = Number(minValue);
      }
      if (maxValue !== undefined && maxValue !== null) {
        filter['variants.price'].$lte = Number(maxValue);
      }
    }

    if (size || color) {
      filter.variants = { $elemMatch: {} };

      if (size) {
        filter.variants.$elemMatch.size = size;
      }

      if (color && typeof color === 'string' && color.trim() !== '') {
        filter.variants.$elemMatch.color = {
          $regex: new RegExp(color.trim(), "i")
        };
      }

      if (Object.keys(filter.variants.$elemMatch).length === 0) {
        delete filter.variants;
      }
    }

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found matching the criteria." });
    }

    res.status(200).json(products);

  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

















