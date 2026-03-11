const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/jobs — Public, with filters
router.get('/', async (req, res) => {
    try {
        const { q, location, type, locationType, experience, salaryMin, featured, page = 1, limit = 12 } = req.query;
        const filter = { isActive: true };
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (type) filter.type = { $in: type.split(',') };
        if (locationType) filter.locationType = locationType;
        if (experience) filter.experience = experience;
        if (salaryMin) filter.salaryMin = { $gte: Number(salaryMin) };
        if (featured === 'true') filter.featured = true;

        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .populate('postedBy', 'name avatar company')
            .sort({ featured: -1, createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/jobs/:id — Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar company email');
        if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/jobs — Manager or Admin only
router.post('/', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const {
            title, company, location, locationType, type, salary, salaryMin, salaryMax,
            experience, description, requirements, responsibilities, benefits, tags,
            featured, companyLogo
        } = req.body;

        const job = new Job({
            title, company, location, locationType, type, salary,
            salaryMin: salaryMin || 0,
            salaryMax: salaryMax || 0,
            experience, description,
            requirements: requirements || [],
            responsibilities: responsibilities || [],
            benefits: benefits || [],
            tags: tags || [],
            featured: featured || false,
            companyLogo: companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=4F46E5&color=fff&size=64&bold=true`,
            postedBy: req.user._id,
        });

        await job.save();
        await job.populate('postedBy', 'name avatar company');
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/jobs/:id — Manager (own job) or Admin
router.put('/:id', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this job' });
        }
        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/jobs/:id — Manager (own job) or Admin
router.delete('/:id', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }
        job.isActive = false;
        await job.save();
        res.json({ message: 'Job removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/jobs/manager/my-jobs — Manager sees their own jobs with applicant counts
router.get('/manager/my-jobs', protect, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const count = await Application.countDocuments({ job: job._id });
            return { ...job.toJSON(), applicationCount: count };
        }));
        res.json(jobsWithCounts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
