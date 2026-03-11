import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiBriefcase, HiLightningBolt, HiStar, HiUsers, HiOfficeBuilding } from 'react-icons/hi';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import StatsCounter from '../components/StatsCounter';
import SkeletonCard from '../components/SkeletonCard';
import { useJobs } from '../context/JobsContext';
import { useAuth } from '../context/AuthContext';

const HERO_WORDS = ['Better.', 'Smarter.', 'Faster.'];

export default function Home() {
    const { jobs } = useJobs();
    const { openAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex(i => (i + 1) % HERO_WORDS.length);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    const featuredJobs = jobs.filter(j => j.featured).slice(0, 6);

    const categories = [
        { icon: '💻', label: 'Engineering', count: 420 },
        { icon: '🎨', label: 'Design', count: 210 },
        { icon: '📊', label: 'Data Science', count: 180 },
        { icon: '📣', label: 'Marketing', count: 150 },
        { icon: '🏢', label: 'Management', count: 120 },
        { icon: '☁️', label: 'DevOps', count: 95 },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-navy-800 dark:from-navy-800 dark:via-navy-900 dark:to-navy-900" />

                {/* Animated orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
                    >
                        <HiLightningBolt className="w-4 h-4 text-accent-400" />
                        <span className="text-white/90 text-sm font-medium">Now featuring 10,000+ remote jobs</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-display font-black text-5xl md:text-7xl text-white leading-tight mb-4"
                    >
                        Hire{' '}
                        <motion.span
                            key={wordIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-emerald-300"
                        >
                            {HERO_WORDS[wordIndex]}
                        </motion.span>
                        <br />
                        <span className="text-white">Work Smarter.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        HireNet connects top companies with talented professionals worldwide.
                        Your next career breakthrough is one search away.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex justify-center mb-10"
                    >
                        <SearchBar />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.55 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    >
                        <Link to="/jobs">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="bg-white text-primary-600 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                                <HiBriefcase className="w-5 h-5" /> Browse Jobs
                                <HiArrowRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        {(!user || user.role !== 'user') && (
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                onClick={() => user ? window.location.href = '/dashboard' : openAuth('register')}
                                className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-2">
                                <HiOfficeBuilding className="w-5 h-5" /> Post a Job
                            </motion.button>
                        )}
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-white/50 text-sm mt-6"
                    >
                        Trusted by 5,000+ companies worldwide
                    </motion.p>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gradient-to-r from-navy-800 to-navy-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatsCounter end={10000} suffix="+" label="Job Listings" />
                        <StatsCounter end={5000} suffix="+" label="Companies" />
                        <StatsCounter end={50000} suffix="+" label="Users" />
                        <StatsCounter end={98} suffix="%" label="Satisfaction Rate" />
                    </div>
                </div>
            </section>

            {/* Job Categories */}
            <section className="py-20 bg-slate-50 dark:bg-navy-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title">Browse by Category</h2>
                        <p className="section-sub">Discover opportunities across the most in-demand fields</p>
                    </motion.div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -6, scale: 1.04 }}
                            >
                                <Link to={`/jobs?q=${cat.label}`}
                                    className="card card-hover p-5 flex flex-col items-center gap-3 text-center cursor-pointer block">
                                    <div className="text-3xl">{cat.icon}</div>
                                    <div>
                                        <p className="font-semibold text-navy-800 dark:text-white text-sm">{cat.label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{cat.count} jobs</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="py-20 bg-white dark:bg-navy-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        className="flex items-end justify-between mb-10"
                    >
                        <div>
                            <h2 className="section-title">Featured Jobs</h2>
                            <p className="section-sub">Hand-picked opportunities from top companies</p>
                        </div>
                        <Link to="/jobs" className="hidden md:flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold hover:gap-2 transition-all text-sm">
                            View all <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                            : featuredJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
                        }
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/jobs">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="btn-primary px-8 py-3.5 text-base">
                                Browse All Jobs <HiArrowRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </section>

            {(!user || user.role !== 'user') && (
                <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-navy-800">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 text-white/90 text-sm">
                                    <HiStar className="w-4 h-4 text-yellow-400" />
                                    Employer Plan
                                </div>
                                <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4 leading-tight">
                                    Looking for <span className="text-accent-300">top talent?</span>
                                </h2>
                                <p className="text-white/75 text-lg mb-8 leading-relaxed">
                                    Post your job opening and connect with thousands of qualified candidates.
                                    Our AI-powered matching gets you the right applicants, fast.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => user ? window.location.href = '/dashboard' : openAuth('register')}
                                        className="bg-white text-primary-600 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                                        <HiOfficeBuilding className="w-5 h-5" />
                                        Post a Job Free
                                    </motion.button>
                                    <button className="border-2 border-white/40 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all">
                                        View Pricing
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="hidden lg:grid grid-cols-2 gap-4"
                            >
                                {[
                                    { icon: <HiUsers className="w-6 h-6" />, stat: '50K+', label: 'Active Job Seekers' },
                                    { icon: <HiBriefcase className="w-6 h-6" />, stat: '3 Days', label: 'Avg. Time to Hire' },
                                    { icon: <HiStar className="w-6 h-6" />, stat: '4.9/5', label: 'Employer Rating' },
                                    { icon: <HiLightningBolt className="w-6 h-6" />, stat: '10K+', label: 'Jobs Posted' },
                                ].map((item, i) => (
                                    <motion.div key={i} whileHover={{ scale: 1.05 }}
                                        className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                        <div className="text-white/70 mb-2">{item.icon}</div>
                                        <div className="font-display font-black text-2xl text-white">{item.stat}</div>
                                        <div className="text-white/70 text-sm">{item.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}
        </div >
    );
}
