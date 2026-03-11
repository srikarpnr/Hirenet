import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBriefcase } from 'react-icons/hi';
import JobCard from '../components/JobCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import SkeletonCard from '../components/SkeletonCard';
import { useJobs } from '../context/JobsContext';

const PAGE_SIZE = 6;

export default function JobListings() {
    const { jobs } = useJobs();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState({ title: searchParams.get('q') || '', location: searchParams.get('loc') || '' });
    const [filters, setFilters] = useState({ types: [], experience: [], location: '', salaryMin: 0 });

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 900);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        return jobs.filter(job => {
            const q = search.title.toLowerCase();
            const loc = search.location.toLowerCase();
            if (q && !job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q) && !job.tags?.some(t => t.toLowerCase().includes(q))) return false;
            if (loc && !job.location.toLowerCase().includes(loc) && !job.locationType.toLowerCase().includes(loc)) return false;
            if (filters.types.length && !filters.types.includes(job.type) && !filters.types.includes(job.locationType)) return false;
            if (filters.experience.length && !filters.experience.includes(job.experience)) return false;
            if (filters.location && !job.location.includes(filters.location) && !job.locationType.includes(filters.location)) return false;
            if (filters.salaryMin > 0 && job.salaryMin < filters.salaryMin) return false;
            return true;
        });
    }, [jobs, search, filters]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (s) => { setSearch(s); setPage(1); };
    const handleFilterChange = (f) => { setFilters(f); setPage(1); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16">
            {/* Top bar */}
            <div className="bg-white dark:bg-navy-800 border-b border-slate-100 dark:border-navy-700 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h1 className="section-title mb-4">Find Your Dream Job</h1>
                        <SearchBar compact onSearch={handleSearch} />
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-72 flex-shrink-0">
                        <FilterSidebar filters={filters} onChange={handleFilterChange} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                <HiBriefcase className="w-4 h-4" />
                                {loading ? (
                                    <span>Loading jobs...</span>
                                ) : (
                                    <span><strong className="text-navy-800 dark:text-white">{filtered.length}</strong> jobs found</span>
                                )}
                            </div>
                            <select className="input-field w-44 text-sm py-2">
                                <option>Most Relevant</option>
                                <option>Newest First</option>
                                <option>Highest Salary</option>
                            </select>
                        </div>

                        {/* Job Cards Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : paged.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="card p-16 text-center">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="font-display font-bold text-navy-800 dark:text-white text-xl mb-2">No jobs found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {paged.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 mt-8">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-600 text-sm font-medium text-navy-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors">
                                    ← Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <motion.button key={p} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page
                                                ? 'bg-primary-500 text-white shadow-md'
                                                : 'text-navy-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
                                            }`}>
                                        {p}
                                    </motion.button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-600 text-sm font-medium text-navy-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors">
                                    Next →
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
