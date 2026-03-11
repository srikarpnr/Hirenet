import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBriefcase, HiMenuAlt3, HiX, HiSun, HiMoon, HiBell } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { dark, toggleDark } = useTheme();
    const { user, logout, openAuth } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location]);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Jobs', path: '/jobs' },
        ...(user?.role === 'admin' || user?.role === 'manager' ? [{ label: 'Companies', path: '/companies' }] : []),
        ...(user ? [{ label: 'Dashboard', path: '/dashboard' }] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl shadow-lg border-b border-slate-100 dark:border-navy-700'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-primary-300/50 transition-all duration-300 group-hover:scale-105">
                                <HiBriefcase className="text-white w-5 h-5" />
                            </div>
                            <span className="font-display font-bold text-xl text-navy-800 dark:text-white">
                                Hire<span className="text-primary-500">Net</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive(link.path)
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                                        : 'text-navy-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-navy-700'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleDark}
                                className="p-2 rounded-lg text-navy-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                            >
                                {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                            </motion.button>

                            {user ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg text-navy-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors relative">
                                        <HiBell className="w-5 h-5" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                                    </motion.button>
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/profile')}>
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 group-hover:ring-primary-400 transition-all" />
                                        <span className="text-sm font-medium text-navy-700 dark:text-slate-200 hidden lg:block">{user.name.split(' ')[0]}</span>
                                    </div>
                                    <button onClick={logout} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => openAuth('login')}
                                        className="btn-ghost text-sm">
                                        Login
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => openAuth('register')}
                                        className="btn-primary text-sm py-2 px-4">
                                        Sign Up
                                    </motion.button>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-lg text-navy-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                            >
                                {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenuAlt3 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-navy-800 shadow-2xl flex flex-col p-6 pt-20">
                            {navLinks.map(link => (
                                <Link key={link.path} to={link.path}
                                    className={`px-4 py-3 rounded-xl font-medium mb-1 transition-all duration-200 ${isActive(link.path)
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                                        : 'text-navy-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700'
                                        }`}>
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-auto flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-700 rounded-xl">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-navy-800 dark:text-white text-sm">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        <button onClick={logout} className="btn-secondary w-full justify-center text-sm">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => openAuth('login')} className="btn-secondary w-full justify-center">Login</button>
                                        <button onClick={() => openAuth('register')} className="btn-primary w-full justify-center">Sign Up</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
