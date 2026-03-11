const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, requireRole } = require('../middleware/auth');

// POST /api/applications — User applies for a job
router.post('/', protect, requireRole('user'), async (req, res) => {
    try {
        const { jobId, fullName, email, phone, coverLetter, resumeUrl, portfolioUrl, yearsOfExperience, currentCompany, noticePeriod } = req.body;

        if (!jobId || !fullName || !email || !phone || !coverLetter) {
            return res.status(400).json({ message: 'Job ID, name, email, phone and cover letter are required' });
        }

        const job = await Job.findById(jobId);
        if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found' });

        const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
        if (existing) return res.status(400).json({ message: 'You have already applied for this job' });

        const application = new Application({
            job: jobId,
            applicant: req.user._id,
            fullName, email, phone, coverLetter,
            resumeUrl: resumeUrl || '',
            portfolioUrl: portfolioUrl || '',
            yearsOfExperience: yearsOfExperience || '',
            currentCompany: currentCompany || '',
            noticePeriod: noticePeriod || '',
        });

        await application.save();
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
        await application.populate('job', 'title company companyLogo');

        res.status(201).json(application);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Already applied to this job' });
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/applications/my — User's own applications
router.get('/my', protect, requireRole('user'), async (req, res) => {
    try {
        const apps = await Application.find({ applicant: req.user._id })
            .populate('job', 'title company companyLogo location type salary')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/applications/job/:jobId — Manager sees applicants for their job
router.get('/job/:jobId', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const apps = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PATCH /api/applications/:id/status — Manager updates application status
router.patch('/:id/status', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const { status, managerNotes } = req.body;
        const app = await Application.findById(req.params.id).populate('job');
        if (!app) return res.status(404).json({ message: 'Application not found' });
        if (req.user.role !== 'admin' && app.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        app.status = status || app.status;
        if (managerNotes !== undefined) app.managerNotes = managerNotes;
        await app.save();
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/applications/check/:jobId — Check if user already applied
router.get('/check/:jobId', protect, async (req, res) => {
    try {
        const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
        res.json({ applied: !!existing, application: existing });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
