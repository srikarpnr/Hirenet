const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
// 🔒 LOCKED to 'user' role only. Admin/Manager are pre-seeded accounts.
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company, title, location } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        // Force role to 'user' — admin/manager are predefined only
        const user = new User({ name, email, password, role: 'user', company, title, location });
        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                company: user.company,
                title: user.title,
                location: user.location,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                company: user.company,
                title: user.title,
                location: user.location,
                savedJobs: user.savedJobs,
            }
        });
    } catch (err) {
        console.error('Auth Register Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
