import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPencil, HiUpload, HiBookmark, HiBriefcase, HiLocationMarker, HiCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import { appsAPI } from '../services/api';
import JobCard from '../components/JobCard';

const TABS = ['Applied Jobs', 'Saved Jobs', 'Resume'];

const STATUS_COLORS = {
    'Pending Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Interview Scheduled': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Hired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const TIMELINE_STEPS = ['Application Sent', 'Under Review', 'Interview Scheduled', 'Decision Made'];

const getTimelineStep = (status) => {
    if (!status || status === 'Pending Review') return 0;
    if (status === 'Under Review') return 1;
    if (status === 'Interview Scheduled') return 2;
    return 3;
};

export default function JobSeekerProfile() {
    const { user, openAuth } = useAuth();
    const { getSavedJobsList } = useJobs();
    const [activeTab, setActiveTab] = useState('Applied Jobs');
    const [editing, setEditing] = useState(false);
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileTitle, setProfileTitle] = useState(user?.title || 'Software Engineer');
    const [profileLocation, setProfileLocation] = useState(user?.location || '');
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        if (user?.role === 'user') {
            setLoadingApps(true);
            appsAPI.getMyApplications()
                .then(res => setApplications(res.data))
                .catch(() => { })
                .finally(() => setLoadingApps(false));
        }
    }, [user]);

    useEffect(() => {
        setProfileName(user?.name || '');
        setProfileTitle(user?.title || 'Software Engineer');
        setProfileLocation(user?.location || '');
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-navy-900">
                <div className="card p-12 text-center max-w-sm">
                    <div className="text-5xl mb-4">👤</div>
                    <h2 className="font-display font-bold text-navy-800 dark:text-white text-xl mb-2">Sign in to view profile</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Access your profile, saved jobs, and application status.</p>
                    <button onClick={() => openAuth('login')} className="btn-primary w-full justify-center">Sign In</button>
                </div>
            </div>
        );
    }

    const savedJobs = getSavedJobsList();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center">
                            <div className="relative inline-block mb-4">
                                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl shadow-md mx-auto" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-500 rounded-full border-2 border-white dark:border-navy-700" />
                            </div>
                            {editing ? (
                                <div className="space-y-3 text-left">
                                    <input value={profileName} onChange={e => setProfileName(e.target.value)} className="input-field text-sm" placeholder="Name" />
                                    <input value={profileTitle} onChange={e => setProfileTitle(e.target.value)} className="input-field text-sm" placeholder="Job title" />
                                    <input value={profileLocation} onChange={e => setProfileLocation(e.target.value)} className="input-field text-sm" placeholder="Location" />
                                    <button onClick={() => setEditing(false)} className="btn-primary w-full justify-center text-sm py-2">
                                        <HiCheck className="w-4 h-4" /> Save
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-display font-bold text-xl text-navy-800 dark:text-white">{profileName}</h2>
                                    <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mt-1">{profileTitle}</p>
                                    {profileLocation && (
                                        <p className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-sm mt-2">
                                            <HiLocationMarker className="w-3.5 h-3.5" /> {profileLocation}
                                        </p>
                                    )}
                                    <button onClick={() => setEditing(true)} className="btn-secondary w-full justify-center text-sm mt-4 py-2">
                                        <HiPencil className="w-3.5 h-3.5" /> Edit Profile
                                    </button>
                                </>
                            )}

                            <div className="border-t border-slate-100 dark:border-navy-600 mt-5 pt-5 grid grid-cols-2 gap-3 text-center">
                                <div className="bg-slate-50 dark:bg-navy-700 rounded-xl p-3">
                                    <div className="font-display font-black text-xl text-primary-600">{applications.length}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Applied</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-navy-700 rounded-xl p-3">
                                    <div className="font-display font-black text-xl text-accent-500">{savedJobs.length}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Saved</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role</p>
                                <span className="badge-primary text-xs capitalize">{user.role}</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Tabs */}
                    <div className="lg:col-span-2">
                        <div className="flex bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-700 rounded-2xl p-1 mb-5">
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            {activeTab === 'Applied Jobs' && (
                                <div>
                                    {loadingApps ? (
                                        <div className="card p-12 text-center text-slate-400">Loading applications...</div>
                                    ) : applications.length === 0 ? (
                                        <div className="card p-12 text-center">
                                            <HiBriefcase className="w-12 h-12 text-slate-300 dark:text-navy-600 mx-auto mb-4" />
                                            <h3 className="font-display font-bold text-navy-800 dark:text-white">No applications yet</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-5">Start applying to jobs to track your applications here</p>
                                            <a href="/jobs" className="btn-primary justify-center">Browse Jobs</a>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {applications.map((application, i) => (
                                                <motion.div key={application._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-5">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <img src={application.job?.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.job?.company || 'Co')}&background=4F46E5&color=fff&size=64&bold=true`}
                                                            alt="" className="w-10 h-10 rounded-xl" />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-navy-800 dark:text-white">{application.job?.title}</h4>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{application.job?.company}</p>
                                                        </div>
                                                        <span className={`badge text-xs ${STATUS_COLORS[application.status] || STATUS_COLORS['Under Review']}`}>{application.status}</span>
                                                    </div>
                                                    {/* Timeline */}
                                                    <div className="flex items-center gap-0 mt-3">
                                                        {TIMELINE_STEPS.map((step, idx) => {
                                                            const currentStep = getTimelineStep(application.status);
                                                            const isComplete = idx <= currentStep;
                                                            const isLast = idx === TIMELINE_STEPS.length - 1;
                                                            return (
                                                                <div key={step} className="flex items-center flex-1">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isComplete ? 'bg-primary-500 border-primary-500' : 'bg-white dark:bg-navy-700 border-slate-300 dark:border-navy-500'}`}>
                                                                            {isComplete && <HiCheck className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 text-center mt-1 w-16 leading-tight">{step}</span>
                                                                    </div>
                                                                    {!isLast && <div className={`flex-1 h-0.5 mb-4 transition-colors ${isComplete ? 'bg-primary-400' : 'bg-slate-200 dark:bg-navy-600'}`} />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {application.job?.salary && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">💰 {application.job.salary} · {application.job?.type}</p>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Saved Jobs' && (
                                <div>
                                    {savedJobs.length === 0 ? (
                                        <div className="card p-12 text-center">
                                            <HiBookmark className="w-12 h-12 text-slate-300 dark:text-navy-600 mx-auto mb-4" />
                                            <h3 className="font-display font-bold text-navy-800 dark:text-white">No saved jobs</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-5">Bookmark jobs to save them here</p>
                                            <a href="/jobs" className="btn-primary justify-center">Browse Jobs</a>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {savedJobs.map((job, i) => <JobCard key={job._id || job.id} job={job} index={i} />)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Resume' && (
                                <div className="card p-6 md:p-8">
                                    <h3 className="font-display font-bold text-navy-800 dark:text-white text-lg mb-2">Resume & Portfolio</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Upload your resume to apply with one click</p>
                                    {resumeUploaded ? (
                                        <div className="border-2 border-accent-400 bg-accent-50 dark:bg-green-900/10 rounded-2xl p-6 text-center">
                                            <div className="text-4xl mb-3">✅</div>
                                            <p className="font-semibold text-accent-700 dark:text-green-400">Resume Uploaded!</p>
                                            <button onClick={() => setResumeUploaded(false)} className="btn-secondary text-sm mt-4 py-2">Replace</button>
                                        </div>
                                    ) : (
                                        <div onClick={() => setResumeUploaded(true)}
                                            className="border-2 border-dashed border-slate-300 dark:border-navy-500 hover:border-primary-400 rounded-2xl p-12 text-center cursor-pointer transition-all group">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <HiUpload className="w-6 h-6 text-primary-500" />
                                            </div>
                                            <p className="font-semibold text-navy-800 dark:text-white mb-1">Click to upload resume</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                                        </div>
                                    )}
                                    <div className="mt-6 space-y-3">
                                        <h4 className="font-semibold text-navy-800 dark:text-white text-sm">Portfolio Links</h4>
                                        {[{ label: 'GitHub', placeholder: 'https://github.com/username' }, { label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' }].map(field => (
                                            <div key={field.label}>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{field.label}</label>
                                                <input type="url" placeholder={field.placeholder} className="input-field text-sm" />
                                            </div>
                                        ))}
                                        <button className="btn-primary text-sm py-2.5">Save Links</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
