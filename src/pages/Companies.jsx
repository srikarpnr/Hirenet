import { motion } from 'framer-motion';
import { HiBriefcase } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { mockCompanies } from '../data/mockData';
import { useJobs } from '../context/JobsContext';

export default function Companies() {
    const { jobs } = useJobs();

    const companiesWithCounts = mockCompanies.map(company => ({
        ...company,
        jobCount: jobs.filter(j => j.company === company.name).length || company.jobs,
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pt-16">
            <div className="bg-white dark:bg-navy-800 border-b border-slate-100 dark:border-navy-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="section-title">Top Companies Hiring</h1>
                        <p className="section-sub">Discover the best companies to work for</p>
                    </motion.div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {companiesWithCounts.map((company, i) => (
                        <motion.div key={company.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                        >
                            <Link to={`/jobs?q=${company.name}`}
                                className="card card-hover p-6 flex items-center gap-4 cursor-pointer block">
                                <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-2xl shadow-md" />
                                <div className="flex-1">
                                    <h3 className="font-display font-bold text-navy-800 dark:text-white">{company.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{company.industry}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary-600 dark:text-primary-400">{company.jobCount}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                                        <HiBriefcase className="w-3 h-3" /> jobs
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
