import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiUser, HiMail, HiPhone, HiDocumentText, HiLink, HiBriefcase } from 'react-icons/hi';
import { appsAPI } from '../services/api';
import { useJobs } from '../context/JobsContext';
import toast from 'react-hot-toast';

export default function ApplyModal({ job, onClose }) {
    const { markApplied } = useJobs();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        resumeUrl: '',
        portfolioUrl: '',
        yearsOfExperience: '',
        currentCompany: '',
        noticePeriod: '',
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        if (!form.coverLetter.trim() || form.coverLetter.trim().length < 50)
            e.coverLetter = 'Cover letter must be at least 50 characters';
        return e;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await appsAPI.apply({ jobId: job._id || job.id, ...form });
            markApplied(job._id || job.id);
            toast.success('Application submitted! 🚀 Good luck!');
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to submit application';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!job) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="relative bg-white dark:bg-navy-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto z-10"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-navy-800 px-8 pt-8 pb-4 border-b border-slate-100 dark:border-navy-700 z-10">
                        <button onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-400">
                            <HiX className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-xl" />
                            <div>
                                <h2 className="font-display font-bold text-xl text-navy-800 dark:text-white">Apply for Position</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    <span className="text-primary-600 font-semibold">{job.title}</span> at {job.company}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        {/* Personal Info */}
                        <div className="bg-slate-50 dark:bg-navy-700/50 rounded-2xl p-4">
                            <h3 className="font-semibold text-navy-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <HiUser className="w-4 h-4 text-primary-500" /> Personal Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Full Name *</label>
                                    <input type="text" placeholder="John Doe" value={form.fullName}
                                        onChange={e => handleChange('fullName', e.target.value)}
                                        className={`input-field text-sm ${errors.fullName ? 'border-red-400' : ''}`} />
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Email *</label>
                                    <input type="email" placeholder="john@email.com" value={form.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        className={`input-field text-sm ${errors.email ? 'border-red-400' : ''}`} />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Phone *</label>
                                    <input type="tel" placeholder="+1 555 000 0000" value={form.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        className={`input-field text-sm ${errors.phone ? 'border-red-400' : ''}`} />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Years of Experience</label>
                                    <select value={form.yearsOfExperience} onChange={e => handleChange('yearsOfExperience', e.target.value)}
                                        className="input-field text-sm">
                                        <option value="">Select...</option>
                                        {['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '10+ years'].map(o => (
                                            <option key={o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-slate-50 dark:bg-navy-700/50 rounded-2xl p-4">
                            <h3 className="font-semibold text-navy-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <HiBriefcase className="w-4 h-4 text-primary-500" /> Professional Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Current Company</label>
                                    <input type="text" placeholder="Current employer" value={form.currentCompany}
                                        onChange={e => handleChange('currentCompany', e.target.value)} className="input-field text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Notice Period</label>
                                    <select value={form.noticePeriod} onChange={e => handleChange('noticePeriod', e.target.value)}
                                        className="input-field text-sm">
                                        <option value="">Select...</option>
                                        {['Immediately available', '2 weeks', '1 month', '2 months', '3+ months'].map(o => (
                                            <option key={o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Resume / CV URL</label>
                                    <div className="relative">
                                        <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="url" placeholder="https://drive.google.com/..." value={form.resumeUrl}
                                            onChange={e => handleChange('resumeUrl', e.target.value)} className="input-field pl-8 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Portfolio / GitHub</label>
                                    <div className="relative">
                                        <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="url" placeholder="https://github.com/..." value={form.portfolioUrl}
                                            onChange={e => handleChange('portfolioUrl', e.target.value)} className="input-field pl-8 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="text-sm font-medium text-navy-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
                                <HiDocumentText className="w-4 h-4 text-primary-500" />
                                Cover Letter * <span className="text-slate-400 font-normal text-xs">(min 50 characters)</span>
                            </label>
                            <textarea rows={5} value={form.coverLetter}
                                onChange={e => handleChange('coverLetter', e.target.value)}
                                placeholder="Tell us why you're a great fit for this role, your relevant experience, and what excites you about this opportunity..."
                                className={`input-field resize-none text-sm leading-relaxed ${errors.coverLetter ? 'border-red-400' : ''}`} />
                            <div className="flex justify-between items-center mt-1">
                                {errors.coverLetter
                                    ? <p className="text-red-500 text-xs">{errors.coverLetter}</p>
                                    : <span />}
                                <span className={`text-xs ${form.coverLetter.length < 50 ? 'text-slate-400' : 'text-accent-500'}`}>
                                    {form.coverLetter.length} / 50+ chars
                                </span>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="btn-secondary flex-1 justify-center">Cancel</button>
                            <motion.button type="submit" disabled={loading}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="btn-primary flex-1 justify-center disabled:opacity-60">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : '🚀 Submit Application'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
