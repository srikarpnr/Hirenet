import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
    HiViewGrid, HiBriefcase, HiUsers, HiCog, HiPlusCircle,
    HiTrash, HiChartBar
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, appsAPI, managerAPI } from '../services/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: HiViewGrid },
    { id: 'post', label: 'Post Job', icon: HiPlusCircle },
    { id: 'jobs', label: 'My Jobs', icon: HiBriefcase },
    { id: 'applicants', label: 'Applicants', icon: HiChartBar },
    { id: 'users', label: 'Users', icon: HiUsers },
    { id: 'settings', label: 'Settings', icon: HiCog },
];

const STATUS_COLORS = {
    'Pending Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Interview Scheduled': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Hired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ROLE_COLORS = {
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    manager: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const APPLICANT_STATUSES = ['Pending Review', 'Under Review', 'Interview Scheduled', 'Hired', 'Rejected'];
const JOB_TYPES_LIST = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXP_LEVELS = ['Entry Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

function emptyForm(user) {
    return {
        title: '', company: user?.company || '', location: '', locationType: 'Remote',
        type: 'Full-time', salary: '', salaryMin: '', salaryMax: '',
        experience: 'Mid-Level', description: '', tags: '',
        requirements: '', responsibilities: '', benefits: '',
        featured: false,
    };
}

export default function ManagerDashboard() {
    const { user, openAuth } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [myJobs, setMyJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingApps, setLoadingApps] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(emptyForm(user));

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (user && (user.role === 'manager' || user.role === 'admin')) {
            setLoadingJobs(true);
            jobsAPI.getMyJobs()
                .then(res => setMyJobs(res.data))
                .catch(() => toast.error('Failed to load jobs'))
                .finally(() => setLoadingJobs(false));
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'users' && user && (user.role === 'manager' || user.role === 'admin')) {
            setLoadingUsers(true);
            managerAPI.getUsers()
                .then(res => setUsers(res.data))
                .catch(() => toast.error('Failed to load users'))
                .finally(() => setLoadingUsers(false));
        }
    }, [activeTab, user]);

    const loadApplicants = async (jobId) => {
        setSelectedJobId(jobId);
        setLoadingApps(true);
        try {
            const res = await appsAPI.getJobApplications(jobId);
            setApplicants(res.data);
        } catch {
            toast.error('Failed to load applicants');
        } finally {
            setLoadingApps(false);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        if (!form.title || !form.company || !form.location || !form.description) {
            toast.error('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                salaryMin: Number(form.salaryMin) || 0,
                salaryMax: Number(form.salaryMax) || 0,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                requirements: form.requirements.split('\n').filter(Boolean),
                responsibilities: form.responsibilities.split('\n').filter(Boolean),
                benefits: form.benefits.split('\n').filter(Boolean),
            };
            const res = await jobsAPI.create(payload);
            setMyJobs(prev => [res.data, ...prev]);
            setForm(emptyForm(user));
            setActiveTab('jobs');
            toast.success('Job posted successfully! 🎉');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to post job');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Delete this job listing?')) return;
        try {
            await jobsAPI.remove(jobId);
            setMyJobs(prev => prev.filter(j => (j._id || j.id) !== jobId));
            toast.success('Job deleted.');
        } catch {
            toast.error('Failed to delete job');
        }
    };

    const updateApplicantStatus = async (appId, status) => {
        try {
            await appsAPI.updateStatus(appId, { status });
            setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            const res = await managerAPI.updateRole(userId, role);
            setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
            toast.success(`Role updated to ${role}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update role');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-navy-900">
                <div className="card p-12 text-center max-w-sm">
                    <div className="text-5xl mb-4">🔐</div>
                    <h2 className="font-display font-bold text-navy-800 dark:text-white text-xl mb-2">Access Required</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Sign in as Manager or Admin to access this dashboard.</p>
                    <button onClick={() => openAuth('login')} className="btn-primary w-full justify-center">Sign In</button>
                </div>
            </div>
        );
    }
    if (user.role === 'user') return <Navigate to="/profile" />;

    const statsCards = [
        { label: 'Active Jobs', value: myJobs.length, icon: HiBriefcase, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        { label: 'Total Applicants', value: myJobs.reduce((s, j) => s + (j.applicationCount || 0), 0), icon: HiChartBar, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-green-900/15' },
        { label: 'Jobs with Applicants', value: myJobs.filter(j => j.applicationCount > 0).length, icon: HiUsers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/15' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16 flex">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-navy-800 border-r border-slate-100 dark:border-navy-700 z-40 flex flex-col transition-transform duration-300 pt-16 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-700 rounded-xl mb-6">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl" />
                        <div className="min-w-0">
                            <p className="font-semibold text-navy-800 dark:text-white text-sm truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {NAV_ITEMS.map(item => {
                            const Icon = item.icon;
                            return (
                                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                    className={activeTab === item.id ? 'sidebar-link-active w-full text-left' : 'sidebar-link w-full text-left'}>
                                    <Icon className="w-5 h-5" /> {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-navy-800 border-b border-slate-100 dark:border-navy-700">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700">
                        <HiViewGrid className="w-5 h-5 text-navy-700 dark:text-slate-300" />
                    </button>
                    <h2 className="font-display font-bold text-navy-800 dark:text-white capitalize">{activeTab}</h2>
                </div>

                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white mb-6">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    {statsCards.map((card, i) => {
                                        const Icon = card.icon;
                                        return (
                                            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="card p-5">
                                                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                                </div>
                                                <div className="text-2xl font-display font-black text-navy-800 dark:text-white">{card.value}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div className="card p-6">
                                        <h3 className="font-display font-bold text-navy-800 dark:text-white mb-4">Recent Job Listings</h3>
                                        {myJobs.length === 0 ? <p className="text-slate-400 text-sm">No jobs posted yet.</p> : (
                                            <div className="space-y-3">
                                                {myJobs.slice(0, 4).map(job => (
                                                    <div key={job._id} className="flex items-center gap-3">
                                                        <img src={job.companyLogo} alt="" className="w-9 h-9 rounded-lg" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-navy-800 dark:text-white text-sm truncate">{job.title}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{job.applicationCount || 0} applicants · {job.salary && <span>{job.salary}</span>}</p>
                                                        </div>
                                                        <span className="badge-primary text-xs">{job.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card p-6">
                                        <h3 className="font-display font-bold text-navy-800 dark:text-white mb-4">Quick Actions</h3>
                                        <div className="space-y-2">
                                            {[
                                                { label: '📝 Post a New Job', action: () => setActiveTab('post'), color: 'btn-primary' },
                                                { label: '📋 View My Jobs', action: () => setActiveTab('jobs'), color: 'btn-secondary' },
                                                { label: '👥 Manage Users', action: () => setActiveTab('users'), color: 'btn-secondary' },
                                            ].map((item, i) => (
                                                <motion.button key={i} whileHover={{ x: 3 }} onClick={item.action} className={`${item.color} w-full justify-start text-sm py-2.5`}>
                                                    {item.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* POST JOB */}
                        {activeTab === 'post' && (
                            <motion.div key="post" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white mb-6">Post a New Job</h1>
                                <div className="card p-6 md:p-8 max-w-3xl">
                                    <form onSubmit={handlePostJob} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Job Title *</label>
                                                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Frontend Engineer" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Company *</label>
                                                <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" className="input-field" />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Location *</label>
                                                <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State or Remote" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Salary Display</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                                    <input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. 8L – 15L per annum" className="input-field pl-7" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Min Salary (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                                    <input type="number" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="600000" className="input-field pl-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Max Salary (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                                    <input type="number" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="1500000" className="input-field pl-7" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Job Type</label>
                                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                                                    {JOB_TYPES_LIST.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Location Type</label>
                                                <select value={form.locationType} onChange={e => setForm(f => ({ ...f, locationType: e.target.value }))} className="input-field">
                                                    {['Remote', 'Hybrid', 'On-site'].map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Experience</label>
                                                <select value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} className="input-field">
                                                    {EXP_LEVELS.map(e => <option key={e}>{e}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Tags (comma separated)</label>
                                            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, TypeScript, Node.js" className="input-field" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Job Description *</label>
                                            <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the role..." className="input-field resize-none" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Requirements (one per line)</label>
                                            <textarea rows={3} value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="3+ years React experience&#10;Strong TypeScript skills" className="input-field resize-none" />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Responsibilities (one per line)</label>
                                                <textarea rows={3} value={form.responsibilities} onChange={e => setForm(f => ({ ...f, responsibilities: e.target.value }))} placeholder="Build scalable features&#10;Code reviews" className="input-field resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">Benefits (one per line)</label>
                                                <textarea rows={3} value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} placeholder="Competitive salary&#10;Health insurance" className="input-field resize-none" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
                                            <label htmlFor="featured" className="text-sm font-medium text-navy-700 dark:text-slate-300">Mark as Featured Job</label>
                                        </div>
                                        <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary text-base px-8 py-3.5 disabled:opacity-60">
                                            {submitting ? 'Publishing...' : '🚀 Publish Job Listing'}
                                        </motion.button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* MY JOBS */}
                        {activeTab === 'jobs' && (
                            <motion.div key="jobs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white">My Job Listings</h1>
                                    <button onClick={() => setActiveTab('post')} className="btn-primary text-sm"><HiPlusCircle className="w-4 h-4" /> Post Job</button>
                                </div>
                                {loadingJobs ? (
                                    <div className="card p-12 text-center text-slate-400">Loading...</div>
                                ) : myJobs.length === 0 ? (
                                    <div className="card p-12 text-center">
                                        <p className="text-slate-400 mb-4">No jobs posted yet.</p>
                                        <button onClick={() => setActiveTab('post')} className="btn-primary">Post Your First Job</button>
                                    </div>
                                ) : (
                                    <div className="card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-navy-700">
                                                        {['Job Title', 'Type', 'Location', 'Salary (₹)', 'Applicants', 'Actions'].map(h => (
                                                            <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                                    {myJobs.map(job => (
                                                        <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <img src={job.companyLogo} alt="" className="w-8 h-8 rounded-lg" />
                                                                    <div>
                                                                        <p className="font-medium text-navy-800 dark:text-white">{job.title}</p>
                                                                        <p className="text-slate-500 dark:text-slate-400 text-xs">{job.company}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3"><span className="badge-primary text-xs">{job.type}</span></td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{job.location}</td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{job.salary ? job.salary : '—'}</td>
                                                            <td className="px-4 py-3">
                                                                <button onClick={() => { setSelectedJobId(job._id); loadApplicants(job._id); setActiveTab('applicants'); }}
                                                                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                                                                    {job.applicationCount || 0} view
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleDeleteJob(job._id)}
                                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                                    <HiTrash className="w-4 h-4" />
                                                                </motion.button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* APPLICANTS */}
                        {activeTab === 'applicants' && (
                            <motion.div key="applicants" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white">Applicants</h1>
                                    <select value={selectedJobId} onChange={e => loadApplicants(e.target.value)}
                                        className="input-field text-sm w-auto min-w-[200px]">
                                        <option value="">Select a job...</option>
                                        {myJobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                                    </select>
                                </div>
                                {!selectedJobId ? (
                                    <div className="card p-12 text-center text-slate-400">Select a job above to view its applicants</div>
                                ) : loadingApps ? (
                                    <div className="card p-12 text-center text-slate-400">Loading applicants...</div>
                                ) : applicants.length === 0 ? (
                                    <div className="card p-12 text-center text-slate-400">No applicants yet for this job.</div>
                                ) : (
                                    <div className="card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-navy-700">
                                                        {['Candidate', 'Contact', 'Experience', 'Notice', 'Portfolio', 'Status', 'Update Status'].map(h => (
                                                            <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                                    {applicants.map(app => (
                                                        <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <p className="font-medium text-navy-800 dark:text-white">{app.fullName}</p>
                                                                    {app.currentCompany && <p className="text-xs text-slate-500">{app.currentCompany}</p>}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-slate-600 dark:text-slate-300">{app.email}</p>
                                                                <p className="text-xs text-slate-500">{app.phone}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.yearsOfExperience || '—'}</td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.noticePeriod || '—'}</td>
                                                            <td className="px-4 py-3">
                                                                {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-xs hover:underline">Resume</a>}
                                                                {app.portfolioUrl && <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-accent-600 text-xs hover:underline ml-2">Portfolio</a>}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`badge text-xs ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <select value={app.status} onChange={e => updateApplicantStatus(app._id, e.target.value)}
                                                                    className="text-xs border border-slate-200 dark:border-navy-600 rounded-lg px-2 py-1.5 bg-white dark:bg-navy-700 text-navy-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400">
                                                                    {APPLICANT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Cover Letters */}
                                        <div className="p-6 border-t border-slate-100 dark:border-navy-600">
                                            <h3 className="font-display font-bold text-navy-800 dark:text-white mb-4">Cover Letters</h3>
                                            <div className="space-y-4">
                                                {applicants.map(app => app.coverLetter && (
                                                    <div key={`cl-${app._id}`} className="bg-slate-50 dark:bg-navy-700 rounded-xl p-4">
                                                        <p className="font-semibold text-navy-800 dark:text-white text-sm mb-1">{app.fullName}</p>
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{app.coverLetter}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* USERS */}
                        {activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white mb-6">User Management</h1>
                                {loadingUsers ? (
                                    <div className="card p-12 text-center text-slate-400">Loading users...</div>
                                ) : users.length === 0 ? (
                                    <div className="card p-12 text-center text-slate-400">No users registered yet.</div>
                                ) : (
                                    <div className="card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-navy-700">
                                                        {['Name', 'Email', 'Current Role', 'Joined', 'Change Role'].map(h => (
                                                            <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                                    {users.map(u => (
                                                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                                                                    <span className="font-medium text-navy-800 dark:text-white">{u.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`badge text-xs capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                                {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <select value={u.role} onChange={e => updateUserRole(u._id, e.target.value)}
                                                                    className="text-xs border border-slate-200 dark:border-navy-600 rounded-lg px-2 py-1.5 bg-white dark:bg-navy-700 text-navy-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400">
                                                                    <option value="user">👤 User</option>
                                                                    <option value="manager">🏢 Manager</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* SETTINGS */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
                                <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white mb-6">Account Settings</h1>
                                <div className="card p-6 space-y-5">
                                    <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-navy-600">
                                        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl" />
                                        <div>
                                            <p className="font-bold text-navy-800 dark:text-white">{user.name}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                                            <span className="badge-primary text-xs mt-1 capitalize">{user.role}</span>
                                        </div>
                                    </div>
                                    {[
                                        { label: 'Full Name', value: user.name, type: 'text' },
                                        { label: 'Email', value: user.email, type: 'email' },
                                        { label: 'Company', value: user.company || '', type: 'text' },
                                    ].map((f, i) => (
                                        <div key={i}>
                                            <label className="text-sm font-semibold text-navy-700 dark:text-slate-300 mb-1 block">{f.label}</label>
                                            <input type={f.type} defaultValue={f.value} className="input-field" />
                                        </div>
                                    ))}
                                    <button className="btn-primary text-sm">Save Changes</button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
