import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiBriefcase, HiDocumentText, HiTrash } from 'react-icons/hi';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    manager: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};
const STATUS_COLORS = {
    'Pending Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Interview Scheduled': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Hired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const TABS = ['Overview', 'Users', 'Jobs', 'Applications'];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!user) return <Navigate to="/" />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" />;

    const load = async (which) => {
        setLoading(true);
        try {
            if (which === 'Overview') {
                const r = await adminAPI.getStats();
                setStats(r.data);
            } else if (which === 'Users') {
                const r = await adminAPI.getUsers();
                setUsers(r.data);
            } else if (which === 'Jobs') {
                const r = await adminAPI.getAllJobs();
                setJobs(r.data);
            } else if (which === 'Applications') {
                const r = await adminAPI.getAllApplications();
                setApplications(r.data);
            }
        } catch {
            toast.error(`Failed to load ${which.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(tab); }, [tab]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed');
        }
    };

    const handleRoleChange = async (id, role) => {
        try {
            const r = await adminAPI.updateRole(id, role);
            setUsers(prev => prev.map(u => u._id === id ? r.data : u));
            toast.success('Role updated');
        } catch {
            toast.error('Failed to update role');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Delete this job and all its applications?')) return;
        try {
            await adminAPI.deleteJob(id);
            setJobs(prev => prev.filter(j => j._id !== id));
            toast.success('Job deleted');
        } catch {
            toast.error('Failed to delete job');
        }
    };

    const statCards = stats ? [
        { label: 'Total Users', value: stats.users, icon: HiUsers, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        { label: 'Active Jobs', value: stats.jobs, icon: HiBriefcase, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-green-900/10' },
        { label: 'Applications', value: stats.applications, icon: HiDocumentText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display font-bold text-2xl text-navy-800 dark:text-white">⚙️ Admin Dashboard</h1>
                    <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Admin</span>
                </div>

                {/* Tabs */}
                <div className="flex bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-700 rounded-2xl p-1 mb-6 w-fit gap-1">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-primary-500 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="card p-12 text-center text-slate-400">Loading...</div>
                ) : (
                    <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        {tab === 'Overview' && stats && (
                            <>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {statCards.map((card, i) => {
                                        const Icon = card.icon;
                                        return (
                                            <div key={i} className="card p-5">
                                                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                                </div>
                                                <div className="text-2xl font-display font-black text-navy-800 dark:text-white">{card.value}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{card.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="card p-6">
                                    <h3 className="font-display font-bold text-navy-800 dark:text-white mb-4">Users by Role</h3>
                                    <div className="flex gap-4 flex-wrap">
                                        {stats.roleBreakdown?.map(r => (
                                            <div key={r._id} className="flex items-center gap-2 bg-slate-50 dark:bg-navy-700 rounded-xl px-4 py-2">
                                                <span className={`badge text-xs capitalize ${ROLE_COLORS[r._id]}`}>{r._id}</span>
                                                <span className="font-bold text-navy-800 dark:text-white">{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {tab === 'Users' && (
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-navy-700">
                                                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                            {users.map(u => (
                                                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-navy-700">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                                                            <span className="font-medium text-navy-800 dark:text-white">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                                                    <td className="px-4 py-3">
                                                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                                            className="text-xs border border-slate-200 dark:border-navy-600 rounded-lg px-2 py-1.5 bg-white dark:bg-navy-700 text-navy-800 dark:text-slate-100">
                                                            {['user', 'manager', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteUser(u._id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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

                        {tab === 'Jobs' && (
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-navy-700">
                                                {['Job', 'Company', 'Type', 'Posted By', 'Date', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                            {jobs.map(job => (
                                                <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-navy-700">
                                                    <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">{job.title}</td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.company}</td>
                                                    <td className="px-4 py-3"><span className="badge-primary text-xs">{job.type}</span></td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.postedBy?.name || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteJob(job._id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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

                        {tab === 'Applications' && (
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-navy-700">
                                                {['Applicant', 'Job', 'Status', 'Applied On'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-navy-600">
                                            {applications.map(app => (
                                                <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-navy-700">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img src={app.applicant?.avatar} alt="" className="w-7 h-7 rounded-full" />
                                                            <div>
                                                                <p className="font-medium text-navy-800 dark:text-white">{app.fullName}</p>
                                                                <p className="text-xs text-slate-500">{app.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.job?.title} @ {app.job?.company}</td>
                                                    <td className="px-4 py-3"><span className={`badge text-xs ${STATUS_COLORS[app.status]}`}>{app.status}</span></td>
                                                    <td className="px-4 py-3 text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
