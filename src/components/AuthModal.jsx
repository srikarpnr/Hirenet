import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiX, HiMail, HiLockClosed, HiUser, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal() {
    const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (authMode === 'register' && !form.name.trim()) e.name = 'Name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Minimum 6 characters';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            if (authMode === 'login') {
                await login(form.email, form.password);
            } else {
                // Registration always creates a 'user' account
                await register(form.name, form.email, form.password, 'user');
            }
            setForm({ name: '', email: '', password: '' });
            setErrors({});
        } catch (err) {
            const msg = err?.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    if (!authModalOpen) return null;

    return (
        <AnimatePresence>
            {authModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAuthModalOpen(false)} />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative bg-white dark:bg-navy-800 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10"
                    >
                        <button onClick={() => setAuthModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-400 transition-colors">
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <HiBriefcase className="text-white w-4 h-4" />
                            </div>
                            <span className="font-display font-bold text-lg text-navy-800 dark:text-white">
                                Hire<span className="text-primary-500">Net</span>
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 dark:bg-navy-700 rounded-xl p-1 mb-6">
                            {['login', 'register'].map(mode => (
                                <button key={mode} onClick={() => { setAuthMode(mode); setErrors({}); }}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${authMode === mode
                                        ? 'bg-white dark:bg-navy-600 text-primary-600 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-2xl font-display font-bold text-navy-800 dark:text-white mb-1">
                            {authMode === 'login' ? 'Welcome back!' : 'Create account'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {authMode === 'login'
                                ? 'Sign in with your HireNet credentials'
                                : 'Join HireNet as a job seeker today'}
                        </p>

                        {/* Predefined accounts hint for login - REMOVED FOR SECURITY */}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <div>
                                    <label className="text-sm font-medium text-navy-700 dark:text-slate-300 mb-1 block">Full Name</label>
                                    <div className="relative">
                                        <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="John Doe" value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`} />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-navy-700 dark:text-slate-300 mb-1 block">Email</label>
                                <div className="relative">
                                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" placeholder="you@example.com" value={form.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`} />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-navy-700 dark:text-slate-300 mb-1 block">Password</label>
                                <div className="relative">
                                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" placeholder="••••••••" value={form.password}
                                        onChange={e => handleChange('password', e.target.value)}
                                        className={`input-field pl-9 ${errors.password ? 'border-red-400' : ''}`} />
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <motion.button type="submit" disabled={loading}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                                    </span>
                                ) : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                            </motion.button>
                        </form>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setErrors({}); }}
                                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                                {authMode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
