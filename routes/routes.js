const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyToken, forgetPassword, resetPassword } = require('../controllers/userController');
const { addProduct, updateProduct, deleteProduct, getProduct, getProductId, getProductBySlug, getProductsBySubCategory } = require('../controllers/productController');
const { addBanner, updateBanner, deleteBanner, getBanner, getBannerById } = require('../controllers/bannerController');
const { addCategory, updateCategory, deleteCategory, getCategory, getCategoryById, getCategoryBySub } = require('../controllers/categoryController');
const { addSubCat, updateSubCat, deleteSubCat, getSubCat, getSubCatById } = require('../controllers/subCategoryController');
const { addBlog, updateBlog, deleteBlog, getBlog, getBlogById } = require('../controllers/blogController');
const { searchData } = require('../controllers/searchController');
const { addContact, verified, dummy } = require('../controllers/contactController');
const { register, login } = require('../controllers/registerController');
const { addCartItem, updateCartItem, deleteCartItem, getCartItems } = require('../controllers/cartController');
const { addWishlistItem, deleteWishlistItem, getWishlistItems } = require('../controllers/wishlistController');

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-token', verifyToken);
router.post('/forget', forgetPassword);
router.post('/reset', resetPassword);

// Category Routes
router.post('/add-category', addCategory);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);
router.get('/get-category', getCategory);
router.get('/edit-category/:id', getCategoryById);

// Sub-Category Routes
router.post('/add-sub', addSubCat);
router.put('/update-sub/:id', updateSubCat);
router.delete('/delete-sub/:id', deleteSubCat);
router.get('/get-sub', getSubCat);
router.get('/edit-sub/:id', getSubCatById);

// Product Routes
router.post('/add-product', addProduct);
router.put('/update-product/:id', updateProduct);
router.delete('/delete-product/:id', deleteProduct);
router.get('/get-product', getProduct);
router.get('/edit-product/:id', getProductId);

// Relation category+subcategory by cat_id
router.get('/get-sub-category/:id', getCategoryBySub);

// Product get by slug
router.get('/get-pro-slug/:slug', getProductBySlug);

// Sub-cat by product
router.get('/get-subcat-pro/:id', getProductsBySubCategory);

// Banner Routes
router.post('/add-banner', addBanner);
router.put('/update-banner/:id', updateBanner);
router.delete('/delete-banner/:id', deleteBanner);
router.get('/get-banner', getBanner);
router.get('/edit-banner/:id', getBannerById);

// Blog Routes
router.post('/add-blog', addBlog);
router.put('/update-blog/:id', updateBlog);
router.delete('/delete-blog/:id', deleteBlog);
router.get('/get-blog', getBlog);
router.get('/edit-blog/:id', getBlogById);

// Search Routes
//router.get('/search/:id', searchData);
router.post('/search', searchData);

// Cart Routes
router.post('/add-cart', addCartItem);
router.get('/get-cart', getCartItems);
router.put('/update-cart/:id', updateCartItem);
router.delete('/delete-cart/:id', deleteCartItem);

// Wishlist Routes
router.post('/add-wishlist', addWishlistItem);
router.get('/get-wishlist', getWishlistItems);
router.delete('/delete-wishlist/:productId', deleteWishlistItem);

//Contact form dummy for flower project
router.post('/contact', addContact);
router.get('/verified', verified);
router.post('/registerr', register);
router.post('/loginn', login);

router.post('/dummy', dummy);

module.exports = router;