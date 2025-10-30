const Contactt = require('../models/contactt');

exports.addContactt = async (req, res) => {
  try {
    const { name, email, website, description } = req.body;

    const contactt = new Contactt({
      name,
      email,
      website,
      description,
    });

    await contactt.save();
    res.status(201).json({ message: 'Contact form created successfully!' });

  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getContactt = async (req, res) => {
  try {
    const contactts = await Contactt.find();
    res.status(200).json(contactts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
