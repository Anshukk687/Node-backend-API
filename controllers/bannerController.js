const multer = require("multer");
const storage = multer.memoryStorage()
const Banner = require('../models/banner');
const { saveBinaryFiles, removeBinaryFile } = require('../config/fileService');
const banner = require("../models/banner");

const upload = multer();

exports.addBanner = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }
        try {
            const folderName = 'images/banners';
            const images = req.files || [];
            let imageMetadata = [];

            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
            }

            req.body.images = imageMetadata;

            const { title, description } = req.body;
            const image = imageMetadata.length > 0
                ? `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[0]}`
                : null;

            const existingBanner = await Banner.findOne({ title });
            if (existingBanner) {
                return res.status(400).json({ message: 'Banner title already exists' });
            }

            const banner = new Banner({ title, description, image });
            await banner.save();

            res.status(201).json({ message: 'Banner created successfully!', banner });
        } catch (error) {
            console.error('Error saving banner:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
}

exports.updateBanner = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }

        try {
            const { id } = req.params;
            const { title, description } = req.body;

            const folderName = 'images/banners';
            const images = req.files || [];
            let imageMetadata = [];

            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
            }

            const existingBanner = await Banner.findById(id);
            if (!existingBanner) {
                return res.status(404).json({ message: 'Banner not found' });
            }

            const duplicateBanner = await Banner.findOne({ title, _id: { $ne: id } });
            if (duplicateBanner) {
                return res.status(400).json({ message: 'Banner title already exists' });
            }

            let image = existingBanner.image;

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
                image
            };

            const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

            res.status(200).json({ message: 'Banner updated successfully!', category: updatedBanner });

        } catch (error) {
            console.error('Error updating banner:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        res.status(200).json({ message: 'Banner deleted', banner: deletedBanner });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getBanner = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.status(200).json({ message: 'Banners fetched successfully', banners });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
    
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json({ message: 'Banner fetched successfully', banner });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
}