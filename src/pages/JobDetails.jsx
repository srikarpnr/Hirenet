import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiLocationMarker, HiCurrencyRupee, HiBookmark, HiShare, HiClock, HiBriefcase, HiCheckCircle } from 'react-icons/hi';
import { useJobs } from '../context/JobsContext';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const TABS = ['Description', 'Requirements', 'Responsibilities', 'Benefits'];

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, toggleSave, applyToJob, isSaved, isApplied } = useJobs();
    const { user, openAuth } = useAuth();
    const [activeTab, setActiveTab] = useState('Description');

    const job = jobs.find(j => j.id === id);

    if (!job) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-navy-900">
                <div className="card p-12 text-center max-w-sm">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="font-display font-bold text-navy-800 dark:text-white text-xl mb-2">Job not found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">This listing no longer exists.</p>
                    <Link to="/jobs" className="btn-primary justify-center">Browse Jobs</Link>
                </div>
            </div>
        );
    }

    const saved = isSaved(job.id);
    const applied = isApplied(job.id);
    const relatedJobs = jobs.filter(j => j.id !== job.id && (j.company === job.company || j.type === job.type)).slice(0, 3);

    const handleApply = () => {
        if (!user) { openAuth('login'); return; }
        applyToJob(job.id);
    };

    const handleSave = () => {
        if (!user) { openAuth('login'); return; }
        toggleSave(job.id);
    };

    const tabContent = {
        Description: (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        ),
        Requirements: (
            <ul className="space-y-3">
                {job.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <HiCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                    </li>
                ))}
            </ul>
        ),
        Responsibilities: (
            <ul className="space-y-3">
                {job.responsibilities?.map((res, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                        </div>
                        <span>{res}</span>
                    </li>
                ))}
            </ul>
        ),
        Benefits: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits?.map((ben, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-accent-50 dark:bg-green-900/10 rounded-xl">
                        <span className="text-accent-500 text-lg">✦</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{ben}</span>
                    </div>
                ))}
            </div>
        ),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back */}
                <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 text-sm font-medium transition-colors">
                    <HiArrowLeft className="w-4 h-4" /> Back to Jobs
                </motion.button>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Job Header Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <img src={job.companyLogo} alt={job.company}
                                    className="w-16 h-16 rounded-2xl shadow-md" />
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="badge-primary">{job.type}</span>
                                        <span className={job.locationType === 'Remote' ? 'badge-accent' : 'badge-navy'}>{job.locationType}</span>
                                        {job.featured && <span className="badge bg-gradient-to-r from-primary-500 to-primary-700 text-white">⭐ Featured</span>}
                                    </div>
                                    <h1 className="font-display font-black text-2xl md:text-3xl text-navy-800 dark:text-white mb-1">{job.title}</h1>
                                    <p className="text-primary-600 dark:text-primary-400 font-semibold text-lg">{job.company}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {[
                                    { icon: <HiLocationMarker />, label: 'Location', value: job.location },
                                    { icon: <HiCurrencyRupee />, label: 'Salary', value: job.salary },
                                    { icon: <HiBriefcase />, label: 'Experience', value: job.experience },
                                    { icon: <HiClock />, label: 'Posted', value: job.postedAt },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-navy-700 rounded-xl">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                            <span className="text-primary-500 w-3.5 h-3.5">{item.icon}</span>
                                            {item.label}
                                        </div>
                                        <span className="font-semibold text-navy-800 dark:text-white text-sm">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {job.tags?.map(tag => (
                                    <span key={tag} className="badge bg-slate-100 dark:bg-navy-600 text-slate-600 dark:text-slate-300 text-sm">{tag}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Content Tabs */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                            <div className="flex border-b border-slate-100 dark:border-navy-600 px-6 overflow-x-auto">
                                {TABS.map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${activeTab === tab
                                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200'
                                            }`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }} className="p-6 md:p-8">
                                {tabContent[activeTab]}
                            </motion.div>
                        </motion.div>

                        {/* Related Jobs */}
                        {relatedJobs.length > 0 && (
                            <div>
                                <h3 className="font-display font-bold text-navy-800 dark:text-white text-xl mb-4">Related Jobs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="card p-6 sticky top-24">
                            <h3 className="font-display font-bold text-navy-800 dark:text-white text-lg mb-4">Apply Now</h3>

                            {applied ? (
                                <div className="bg-accent-50 dark:bg-green-900/20 border border-accent-200 dark:border-green-700 rounded-2xl p-4 text-center mb-4">
                                    <div className="text-3xl mb-2">🚀</div>
                                    <p className="font-semibold text-accent-700 dark:text-green-400">Application Submitted!</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We'll notify you of any updates</p>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(79,70,229,0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleApply}
                                    className="btn-primary w-full justify-center text-base py-4 mb-3">
                                    Apply for this Position
                                </motion.button>
                            )}

                            <div className="flex gap-2">
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={handleSave}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${saved
                                            ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-slate-200 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                                        }`}>
                                    <HiBookmark className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-navy-600 font-semibold text-sm text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-all"
                                    onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
                                    <HiShare className="w-4 h-4" /> Share
                                </motion.button>
                            </div>

                            <div className="mt-6 p-4 bg-slate-50 dark:bg-navy-700 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl" />
                                    <div>
                                        <p className="font-semibold text-navy-800 dark:text-white text-sm">{job.company}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Verified Employer ✓</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                                    <div className="flex justify-between">
                                        <span>Posted</span>
                                        <span className="font-medium text-navy-700 dark:text-slate-300">{job.postedAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Job ID</span>
                                        <span className="font-medium text-navy-700 dark:text-slate-300">#{job.id.padStart(4, '0')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Experience</span>
                                        <span className="font-medium text-navy-700 dark:text-slate-300">{job.experience}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
