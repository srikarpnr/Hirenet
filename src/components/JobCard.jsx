import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiBookmark, HiLocationMarker, HiClock, HiCurrencyDollar, HiBriefcase, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import ApplyModal from './ApplyModal';

const TYPE_COLORS = {
    'Full-time': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Part-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Remote': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Contract': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Internship': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function JobCard({ job, index = 0 }) {
    const { user, openAuth } = useAuth();
    const { toggleSave, isSaved, isApplied } = useJobs();
    const [showApply, setShowApply] = useState(false);

    const jobId = job._id || job.id;
    const saved = isSaved(jobId);
    const applied = isApplied(jobId);

    // Format virtual postedAt from createdAt if not a string already
    const postedAt = job.postedAt || (job.createdAt
        ? (() => {
            const diff = Date.now() - new Date(job.createdAt);
            const days = Math.floor(diff / 86400000);
            if (days === 0) return 'Today';
            if (days === 1) return '1 day ago';
            if (days < 7) return `${days} days ago`;
            return `${Math.floor(days / 7)} week(s) ago`;
        })()
        : '');

    const handleSave = (e) => {
        e.preventDefault();
        if (!user) return openAuth('login');
        toggleSave(jobId);
    };

    const handleApply = (e) => {
        e.preventDefault();
        if (!user) return openAuth('login');
        if (user.role === 'manager' || user.role === 'admin') return;
        setShowApply(true);
    };

    const typeColor = TYPE_COLORS[job.type] || TYPE_COLORS['Full-time'];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                whileHover={{ y: -3 }}
                className={`card card-hover relative group ${job.featured ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
            >
                {job.featured && (
                    <div className="absolute top-3 right-3 badge bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs">
                        ⭐ Featured
                    </div>
                )}

                <Link to={`/jobs/${jobId}`} className="block p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <img src={job.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=4F46E5&color=fff&size=64&bold=true`}
                            alt={job.company} className="w-12 h-12 rounded-xl shadow-sm flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-navy-800 dark:text-white text-base leading-tight truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{job.company}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><HiLocationMarker className="w-3.5 h-3.5 text-slate-400" />{job.location}</span>
                        {job.salary && <span className="flex items-center gap-1 text-accent-600 dark:text-accent-400 font-medium">₹ {job.salary}</span>}
                        {postedAt && <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" />{postedAt}</span>}
                    </div>

                    {job.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="badge bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 text-xs">{tag}</span>
                            ))}
                            {job.tags.length > 3 && <span className="badge bg-slate-100 dark:bg-navy-700 text-slate-500 text-xs">+{job.tags.length - 3}</span>}
                        </div>
                    )}
                </Link>

                <div className="px-5 pb-5 flex items-center gap-2">
                    <span className={`badge text-xs ${typeColor}`}>
                        <HiBriefcase className="w-3 h-3" /> {job.type}
                    </span>
                    {job.locationType && (
                        <span className="badge bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 text-xs">{job.locationType}</span>
                    )}
                    <div className="flex-1" />
                    {/* Save */}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSave}
                        className={`p-2 rounded-xl border transition-all ${saved ? 'border-primary-200 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'border-slate-200 dark:border-navy-600 text-slate-400 hover:border-primary-300 hover:text-primary-500'}`}>
                        <HiBookmark className="w-4 h-4" />
                    </motion.button>
                    {/* Apply */}
                    {(!user || user.role === 'user') && (
                        applied ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-600 dark:text-accent-400 px-3 py-2">
                                <HiCheckCircle className="w-4 h-4" /> Applied
                            </span>
                        ) : (
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleApply}
                                className="btn-primary text-xs py-2 px-3.5">
                                Apply Now
                            </motion.button>
                        )
                    )}
                </div>
            </motion.div>

            {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}
        </>
    );
}
