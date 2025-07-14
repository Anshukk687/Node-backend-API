const SubCat = require('../models/subCategory');

exports.addSubCat = async (req, res) => {
    try {
        const { category_id, title, isActive } = req.body;

        const existingSubCat = await SubCat.findOne({ title });
        if (existingSubCat) {
            return res.status(400).json({ message: 'SubCategory title already exists' });
        }

        const subCat = new SubCat({ category_id, title, isActive });
        await subCat.save();

        res.status(201).json({ message: 'Sub Category Created Sucessfully !!', subCat });
        
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateSubCat = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, title, isActive } = req.body;

        const updatedSubCat = await SubCat.findByIdAndUpdate(
            id,
            { category_id, title, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedSubCat) {
            return res.status(404).json({ message: 'Sub Category not found' });
        }

        res.status(200).json({ message: 'Sub Category updated', subCat: updatedSubCat });

    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({message: 'Server error'});
    }
}

exports.deleteSubCat = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteSubCat = await SubCat.findByIdAndDelete(id);

        if(!deleteSubCat) {
            return res.status(400).json({message: 'Sub Category not found'});
        }

        res.status(200).json({message: 'Sub Category Deleted', subCat: deleteSubCat});
    } catch(error) {
        console.error('Error saving user:', error);
        res.status(500).json({message: 'Server error'});
    }
}

exports.getSubCat = async (req, res) => {
    try {
        const getSubCat = await SubCat.find();
        res.status(200).json(getSubCat);
    } catch(error) {
        console.error('Error Saving User:', error);
        res.status(500).json({message: 'Server error'});
    }
}

exports.getSubCatById = async (req, res) => {
    try {
        const { id } = req.params;
        const getSubCatById = await SubCat.findById(id).populate('category_id', 'title');
        res.status(200).json(getSubCatById);
    } catch(error) {
        console.error('Error getting sub category:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


