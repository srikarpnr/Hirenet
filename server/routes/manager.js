const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

// Manager (and Admin) can view all users and change 'user' roles
// Managers cannot grant admin/manager privileges to others (only admins can)

// GET /api/manager/users — list all users
router.get('/users', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PATCH /api/manager/users/:id/role — manager can set role to user/manager (not admin)
router.patch('/users/:id/role', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const allowedRoles = req.user.role === 'admin' ? ['user', 'manager', 'admin'] : ['user', 'manager'];
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'You cannot assign this role' });
        }
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Cannot change admin accounts' });
        }
        const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
