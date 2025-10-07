const Blog = require('../models/blog');
const { saveBinaryFiles } = require('../config/fileService');
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer();

const fs = require('fs');
const path = require('path');

exports.addBlog = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }

        try {
            const folderName = 'images/blogs';
            const images = req.files || [];
            let imageMetadata = [];

            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
            }

            const image = imageMetadata.length > 0
                ? `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[0]}`
                : null;

            const { title, content, admin_id, status } = req.body;

            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const existingBlog = await Blog.findOne({ slug });
            if (existingBlog) {
                return res.status(400).json({ message: 'Blog slug or title already exists' });
            }

            const blog = new Blog({
                admin_id,
                title,
                slug,
                content,
                image,
                status,
                published_at: new Date()
            });

            await blog.save();

            res.status(201).json({ message: 'Blog created successfully!', blog });

        } catch (error) {
            console.error('Error saving blog:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.updateBlog = async (req, res) => {
    upload.any()(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(500).json({ message: "File upload error", error: uploadError });
        }
        try {
            const { id } = req.params;
            const { title, content, admin_id, status } = req.body;
            const folderName = 'images/blogs';
            const images = req.files || [];
            let imageMetadata = [];
            let image = null;
            if (images.length > 0) {
                imageMetadata = await saveBinaryFiles(images, folderName);
                image = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${imageMetadata[0]}`;
            }

            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            if (title) {
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
                if (existingBlog) {
                    return res.status(400).json({ message: 'Blog slug or title already exists' });
                }
                blog.title = title;
                blog.slug = slug;
            }
            if (content) blog.content = content;
            if (admin_id) blog.admin_id = admin_id;
            if (status !== undefined) blog.status = status;
            if (image) blog.image = image;
            blog.published_at = new Date();

            await blog.save();
            res.status(200).json({ message: 'Blog updated successfully!', blog });
        } catch (error) {
            console.error('Error updating blog:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBlog = async (req, res) => {
    try {
        const getBlog = await Blog.find();
        res.status(200).json(getBlog);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const getBlogById = await Blog.findById(id);

        if (!getBlogById) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(getBlogById);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Server error' });
    }
};