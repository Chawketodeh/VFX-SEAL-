const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, company, email, password, country, roleInCompany, linkedin } = req.body;

        // Validation
        if (!name || !company || !email || !password || !country || !roleInCompany) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Create user with PENDING status
        const user = await User.create({
            name,
            company,
            email: email.toLowerCase(),
            passwordHash: password, // Pre-save hook will hash it
            country,
            roleInCompany,
            linkedin: linkedin || '',
            role: 'STUDIO',
            status: 'PENDING',
        });

        // Stub: Log confirmation email
        console.log(`📧 [EMAIL STUB] Confirmation email sent to: ${user.email}`);
        console.log(`   Subject: Welcome to VFX Seal — Account Under Review`);

        res.status(201).json({
            message: 'Account created successfully. Your account is pending admin approval.',
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// GET /api/auth/me — get current user profile
router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
