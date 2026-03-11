import { useState } from 'react';
import { HiX, HiFilter } from 'react-icons/hi';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
const LOCATIONS = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL'];

export default function FilterSidebar({ filters, onChange }) {
    const [open, setOpen] = useState(false);

    const toggleType = (type) => {
        const current = filters.types || [];
        onChange({
            ...filters,
            types: current.includes(type) ? current.filter(t => t !== type) : [...current, type],
        });
    };

    const toggleExp = (exp) => {
        const current = filters.experience || [];
        onChange({
            ...filters,
            experience: current.includes(exp) ? current.filter(e => e !== exp) : [...current, exp],
        });
    };

    const clearAll = () => onChange({ types: [], experience: [], location: '', salaryMin: 0 });
    const hasFilters = (filters.types?.length || filters.experience?.length || filters.location || filters.salaryMin > 0);

    const content = (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-navy-800 dark:text-white text-lg flex items-center gap-2">
                    <HiFilter className="w-4 h-4 text-primary-500" /> Filters
                </h3>
                {hasFilters && (
                    <button onClick={clearAll} className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                        <HiX className="w-3 h-3" /> Clear all
                    </button>
                )}
            </div>

            {/* Job Type */}
            <div>
                <h4 className="font-semibold text-navy-700 dark:text-slate-200 text-sm mb-3">Job Type</h4>
                <div className="flex flex-col gap-2">
                    {JOB_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${(filters.types || []).includes(type)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-slate-300 dark:border-navy-500 group-hover:border-primary-400'
                                }`}
                                onClick={() => toggleType(type)}>
                                {(filters.types || []).includes(type) && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-navy-800 dark:group-hover:text-white transition-colors"
                                onClick={() => toggleType(type)}>
                                {type}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div>
                <h4 className="font-semibold text-navy-700 dark:text-slate-200 text-sm mb-3">Experience Level</h4>
                <div className="flex flex-col gap-2">
                    {EXPERIENCE_LEVELS.map(exp => (
                        <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${(filters.experience || []).includes(exp)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-slate-300 dark:border-navy-500 group-hover:border-primary-400'
                                }`}
                                onClick={() => toggleExp(exp)}>
                                {(filters.experience || []).includes(exp) && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-navy-800 dark:group-hover:text-white transition-colors"
                                onClick={() => toggleExp(exp)}>
                                {exp}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div>
                <h4 className="font-semibold text-navy-700 dark:text-slate-200 text-sm mb-3">Location</h4>
                <select
                    value={filters.location || ''}
                    onChange={e => onChange({ ...filters, location: e.target.value })}
                    className="input-field text-sm">
                    <option value="">All Locations</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>

            {/* Salary */}
            <div>
                <h4 className="font-semibold text-navy-700 dark:text-slate-200 text-sm mb-3">
                    Min Salary: ₹{((filters.salaryMin || 0) / 100000).toFixed(1)}L+
                </h4>
                <input
                    type="range" min="0" max="5000000" step="100000"
                    value={filters.salaryMin || 0}
                    onChange={e => onChange({ ...filters, salaryMin: Number(e.target.value) })}
                    className="w-full accent-primary-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>₹0</span>
                    <span>₹50L+</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-4">
                <button onClick={() => setOpen(!open)}
                    className="btn-secondary w-full justify-center text-sm">
                    <HiFilter className="w-4 h-4" /> {open ? 'Hide Filters' : 'Show Filters'}
                    {hasFilters && <span className="ml-1 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                        {(filters.types?.length || 0) + (filters.experience?.length || 0) + (filters.location ? 1 : 0)}
                    </span>}
                </button>
                {open && <div className="card p-5 mt-3">{content}</div>}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block card p-6 sticky top-24">
                {content}
            </div>
        </>
    );
}
