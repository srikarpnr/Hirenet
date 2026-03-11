const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyLogo: { type: String, default: '' },
    location: { type: String, required: true },
    locationType: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    salary: { type: String, default: '' },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    experience: { type: String, enum: ['Entry Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'], default: 'Mid-Level' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual for postedAt display
jobSchema.virtual('postedAt').get(function () {
    const diff = Date.now() - this.createdAt;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
