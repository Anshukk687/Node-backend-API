const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            admin: {
                id: admin._id,
                email: admin.email,
                token,
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// exports.adminRegister = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const token = jwt.sign(
//             { email: email },
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//         );
//         const admin = new Admin({
//             email,
//             password: hashedPassword,
//             token,
//         });
//         await admin.save();
//         res.status(201).json({ message: 'Admin registration successful!' });
//     } catch (err) {
//         console.error('Register error:', err.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
