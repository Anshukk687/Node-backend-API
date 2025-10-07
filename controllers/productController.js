const Product = require('../models/product');
const { saveBinaryFiles } = require('../config/fileService');
const multer = require('multer');
const storage = multer.memoryStorage();
const slugify = require('slugify');
const subCategory = require('../models/subCategory');

const upload = multer();

const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete file:', err);
        });
    }
};

const extractFilePath = (url, req) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    const relativePath = url.replace(baseUrl, '');
    return path.join(__dirname, '../../uploads', relativePath);
};


exports.addProduct = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }

        try {
            const folderName = 'images/products';
            const images = req.files || [];
            let imageMetadata = await saveBinaryFiles(images, folderName);

            const fileMap = {};
            for (let i = 0; i < images.length; i++) {
                const field = images[i].fieldname;
                const match = field.match(/^variant_images\[(\d+)]$/);
                if (match) {
                    const index = match[1];
                    if (!fileMap[index]) fileMap[index] = [];
                    fileMap[index].push(`${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[i]}`);
                } else if (field === 'image') {
                    fileMap['mainImage'] = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[i]}`;
                }
            }

            // Parse variants from body
            let variants = req.body.variants;
            if (typeof variants === 'string') {
                variants = JSON.parse(variants);
            }

            // Build productVariants array
            const productVariants = variants.map((variant, index) => ({
                size: variant.size,
                color: variant.color,
                price: Number(variant.price),
                stock: Number(variant.stock),
                images: (fileMap[index] && fileMap[index].length > 0)
                    ? fileMap[index]
                    : variant.images || [],
            }));

            const { category_id, subcat_id, title, brand, description, rating, pricee } = req.body;

            // Duplicate check
            const existingProduct = await Product.findOne({ title });
            if (existingProduct) {
                return res.status(400).json({ message: 'Product title already exists' });
            }

            const newProduct = new Product({
                category_id,
                subcat_id,
                title,
                slug: slugify(title),
                brand,
                description,
                rating,
                pricee,
                image: fileMap.mainImage || null,
                variants: productVariants,
            });

            const savedProduct = await newProduct.save();

            res.status(201).json({
                message: "Product Created Successfully!",
                product: savedProduct,
            });
        } catch (err) {
            res.status(500).json({ message: "Error creating product", error: err.message });
        }
    });
};

exports.updateProduct = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }

        try {
            const folderName = 'images/products';
            const files = req.files || [];
            const savedFilenames = files.length > 0 ? await saveBinaryFiles(files, folderName) : [];

            // Map uploaded files
            const fileMap = {};
            for (let i = 0; i < files.length; i++) {
                const field = files[i].fieldname;
                const match = field.match(/^variant_images\[(\d+)]$/);
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${savedFilenames[i]}`;

                if (match) {
                    const index = match[1];
                    if (!fileMap[index]) fileMap[index] = [];
                    fileMap[index].push(fileUrl);
                } else if (field === 'image') {
                    fileMap.mainImage = fileUrl;
                }
            }

            const { id } = req.params;
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Parse variants JSON from body
            let variants = req.body.variants;
            if (typeof variants === 'string') {
                variants = JSON.parse(variants);
            }

            const updatedVariants = variants.map((variant, index) => {
                const old = existingProduct.variants[index] || {};

                // These are images that user wants to keep (still displayed in UI)
                const keptOldImages = Array.isArray(variant.existingImages) ? variant.existingImages : [];

                // Delete removed old images from server
                if (Array.isArray(old.images)) {
                    old.images.forEach((imgUrl) => {
                        if (!keptOldImages.includes(imgUrl)) {
                            deleteFile(extractFilePath(imgUrl, req)); // Remove deleted images
                        }
                    });
                }

                // Combine existing kept images with newly uploaded ones
                const newUploaded = fileMap[index] || [];
                const finalImages = [...keptOldImages, ...newUploaded];

                return {
                    size: variant.size,
                    color: variant.color,
                    price: Number(variant.price),
                    stock: Number(variant.stock),
                    images: finalImages
                };
            });

            // Handle main image update
            let mainImage = existingProduct.image;
            if (fileMap.mainImage) {
                if (mainImage) deleteFile(extractFilePath(mainImage, req));
                mainImage = fileMap.mainImage;
            }

            const { title, category_id, subcat_id, brand, description, rating, pricee } = req.body;
            const slug = slugify(title, { lower: true, strict: true });

            // Ensure unique title
            const existingTitle = await Product.findOne({ title, _id: { $ne: id } });
            if (existingTitle) {
                return res.status(400).json({ message: "Title already in use" });
            }

            // Save updated product
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    title,
                    slug,
                    brand,
                    category_id,
                    subcat_id,
                    description,
                    rating,
                    pricee,
                    image: mainImage,
                    variants: updatedVariants
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Product updated successfully",
                product: updatedProduct
            });

        } catch (error) {
            console.error("Update error:", error);
            return res.status(500).json({ message: "Internal error", error: error.message });
        }
    });
};



exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted', product: deletedProduct });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getProduct = async (req, res) => {
    try {
        const getProduct = await Product.find();
        res.status(200).json(getProduct);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getProductId = async (req, res) => {
    try {
        const { id } = req.params;
        const getProductId = await Product.findById(id);

        if (!getProductId) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(getProductId);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const getProductSlug = await Product.findOne({ slug });
        if (!getProductSlug) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(getProductSlug);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });

    }
}

exports.getProductsBySubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.find({ subcat_id: id });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by subcategory:", error);
        res.status(500).json({ message: "Server error" });
    }
}