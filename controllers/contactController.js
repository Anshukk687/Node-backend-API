const Contact = require('../models/contact');

exports.addContact = async (req, res) => {
    try {
        const { name, email, phoneNumber, description } = req.body;

        const contact = new Contact({ name, email, phoneNumber, description });
        await contact.save();

        res.status(201).json({ message: 'Contact form created successfully!', contact });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
