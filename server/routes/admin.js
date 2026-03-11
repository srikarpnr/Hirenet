const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [users, jobs, applications] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments({ isActive: true }),
            Application.countDocuments(),
        ]);
        const roleBreakdown = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        res.json({ users, jobs, applications, roleBreakdown });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'manager', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PATCH /api/admin/jobs/:id/status — toggle active/inactive
router.patch('/jobs/:id/status', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        job.isActive = !job.isActive;
        await job.save();
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/admin/jobs/:id (hard delete)
router.delete('/jobs/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        await Application.deleteMany({ job: req.params.id });
        res.json({ message: 'Job and related applications deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/admin/applications
router.get('/applications', async (req, res) => {
    try {
        const apps = await Application.find()
            .populate('applicant', 'name email avatar')
            .populate('job', 'title company')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
