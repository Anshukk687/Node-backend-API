const multer = require("multer");
const storage = multer.memoryStorage()
const Category = require('../models/category');
const SubCat = require('../models/subCategory');
const { saveBinaryFiles, removeBinaryFile } = require('../config/fileService');

const upload = multer();

exports.addCategory = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }
        try {
            const folderName = 'images/categories';
            const images = req.files || [];
            let imageMetadata = [];

            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
            }

            req.body.images = imageMetadata;

            const { title, description, isActive } = req.body;

            const image = imageMetadata.length > 0
                ? `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[0]}`
                : null;

            const existingCategory = await Category.findOne({ title });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category title already exists' });
            }
            console.log(image);

            const category = new Category({ title, description, image, isActive });
            await category.save();

            res.status(201).json({ message: 'Category created successfully!', category });
        } catch (error) {
            console.error('Error saving category:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.updateCategory = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }

        try {
            const { id } = req.params;
            const { title, description, isActive } = req.body;

            const folderName = 'images/categories';
            const images = req.files || [];
            let imageMetadata = [];

            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
            }

            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const duplicateCategory = await Category.findOne({ title, _id: { $ne: id } });
            if (duplicateCategory) {
                return res.status(400).json({ message: 'Category title already exists' });
            }

            let image = existingCategory.image;

            if (imageMetadata.length > 0) {
                if (image) {
                    const parts = image.split('/');
                    const oldFileName = parts[parts.length - 1];
                    await removeBinaryFile(oldFileName, folderName);
                }

                image = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[0]}`;
            }

            const updateData = {
                title,
                description,
                isActive,
                image
            };

            const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

            res.status(200).json({ message: 'Category updated successfully!', category: updatedCategory });

        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.deleteCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const deleteCategory = await Category.findByIdAndDelete(id);

        if(!deleteCategory){
            return res.status(404).json({message: 'Category not found'});
        }

        res.status(200).json({message: 'Category Deleted', category: deleteCategory});
    } catch(error) {
        console.error('Error getting category:', error);
        res.status(500).json({message: 'Server error'});
    }
}

exports.getCategory = async (req, res) => {
    try {
        const getCategory = await Category.find();
        res.status(200).json(getCategory);
    } catch(error) {
        console.error('Error getting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const getCategoryById = await Category.findById(id);

        if (!getCategoryById) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(getCategoryById);
    } catch (error) {
        console.error('Error getting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getCategoryBySub = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const subcategories = await SubCat.find({ category_id: id }).populate('category_id', 'title');

        res.status(200).json({
            category,
            subcategories
        });
    } catch (error) {
        console.error('Error getting category:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

