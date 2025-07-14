const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const token = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );
        const expire_token = new Date(Date.now() + 5 * 60 * 1000);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            token,
            expire_token,
            isVerified: false
        });

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `
          <h2>Hello ${name},</h2>
          <p>Click the link below to verify your email. This link will expire in 5 minutes.</p>
          <a href="${process.env.REACT_URL}/verify?token=${token}">Verify Email</a>
        `
        });

        res.status(201).json({ message: 'User registered & verification email sent' });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyToken = async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user not found' });
        }

        const now = new Date();
        if (now > user.expire_token) {
            return res.status(400).json({ message: 'Token has expired' });
        }

        user.isVerified = true;
        //user.token = null;
        //user.expire_token = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });

    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "5m" });
        const expire_token = new Date(Date.now() + 5 * 60 * 1000);

        user.token = token;
        user.expire_token = expire_token;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset your password",
            html: `
          <h2>Hello ${email},</h2>
          <p>Click the link below to reset your password. This link will expire in 5 minutes.</p>
          <a href="${process.env.REACT_URL}/reset-password?token=${token}">Reset Password</a>
        `,
        });

        res.json({ message: "Password reset link sent to your email." });
    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token and password are required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.token !== token || user.expire_token < Date.now()) {
            return res.status(400).json({ message: "Token is invalid or has expired." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // user.token = null;
        // user.expire_token = null;

        await user.save();

        res.json({ message: "Password reset successfully." });
    } catch (err) {
        console.error("Reset password error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
