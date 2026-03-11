const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Application form fields
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    coverLetter: { type: String, required: true },
    resumeUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    yearsOfExperience: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    noticePeriod: { type: String, default: '' },
    // Status management
    status: {
        type: String,
        enum: ['Pending Review', 'Under Review', 'Interview Scheduled', 'Hired', 'Rejected'],
        default: 'Pending Review'
    },
    managerNotes: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
