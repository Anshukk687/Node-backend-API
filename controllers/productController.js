const Product = require('../models/product');
const { saveBinaryFiles } = require('../config/fileService');
const multer = require('multer');
const storage = multer.memoryStorage();
const slugify = require('slugify');
const subCategory = require('../models/subCategory');

const upload = multer();

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
                const match = field.match(/^variant_images\[(\d+)]\[(\w+)]$/);
                if (match) {
                    const [_, index, position] = match;
                    if (!fileMap[index]) fileMap[index] = {};
                    fileMap[index][position] = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[i]}`;
                } else if (field === 'image') {
                    fileMap['mainImage'] = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[i]}`;
                }
            }

            let variants = req.body.variants;
            if (typeof variants === 'string') {
                variants = JSON.parse(variants);
            }

            const productVariants = variants.map((variant, index) => ({
                size: variant.size,
                color: variant.color,
                price: Number(variant.price),
                stock: Number(variant.stock),
                front: fileMap[index]?.front || null,
                back: fileMap[index]?.back || null,
                side: fileMap[index]?.side || null,
            }));

            const { category_id, subcat_id, title, brand, description, rating, pricee } = req.body;

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
            const images = req.files || [];
            const imageMetadata = images.length > 0 ? await saveBinaryFiles(images, folderName) : [];

            const fileMap = {};
            for (let i = 0; i < images.length; i++) {
                const field = images[i].fieldname;
                const match = field.match(/^variant_images\[(\d+)]\[(\w+)]$/);
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[i]}`;

                if (match) {
                    const [_, index, type] = match;
                    if (!fileMap[index]) fileMap[index] = {};
                    fileMap[index][type] = fileUrl;
                } else if (field === 'image') {
                    fileMap.mainImage = fileUrl;
                }
            }

            const { id } = req.params;
            const existingProduct = await Product.findById(id);
            if (!existingProduct) return res.status(404).json({ message: "Product not found" });

            // Parse variants
            let variants = req.body.variants;
            if (typeof variants === 'string') variants = JSON.parse(variants);

            const updatedVariants = variants.map((variant, index) => {
                const old = existingProduct.variants[index] || {};
                const updated = {
                    size: variant.size,
                    color: variant.color,
                    price: Number(variant.price),
                    stock: Number(variant.stock),
                    front: variant.front || fileMap[index]?.front || null,
                    back: variant.back || fileMap[index]?.back || null,
                    side: variant.side || fileMap[index]?.side || null,
                };

                ['front', 'back', 'side'].forEach(img => {
                    if (fileMap[index]?.[img] && old[img]) {
                        deleteFile(extractFilePath(old[img], req));
                    }
                    if (variant[img] === null && old[img]) {
                        deleteFile(extractFilePath(old[img], req));
                        updated[img] = null;
                    }
                });

                return updated;
            });

            let mainImage = existingProduct.image;
            if (fileMap.mainImage) {
                deleteFile(extractFilePath(mainImage, req));
                mainImage = fileMap.mainImage;
            }

            const { title, category_id, subcat_id, brand, description, rating, pricee } = req.body;
            const slug = slugify(title, { lower: true, strict: true });

            const titleExists = await Product.findOne({ title, _id: { $ne: id } });
            if (titleExists) {
                return res.status(400).json({ message: 'Title already in use' });
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, {
                title, slug, brand, category_id, subcat_id,
                description, rating, pricee,
                image: mainImage,
                variants: updatedVariants
            }, { new: true });

            return res.status(200).json({ message: "Product updated", product: updatedProduct });

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
        console.log(slug);
        const getProductSlug = await Product.findOne({ slug });
        console.log(getProductSlug);
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