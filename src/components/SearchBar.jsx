import { useState } from 'react';
import { HiSearch, HiLocationMarker } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ compact = false, onSearch }) {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch({ title, location });
        } else {
            navigate(`/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(location)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row gap-2 ${compact ? 'w-full' : 'w-full max-w-2xl'}`}>
            <div className={`flex flex-1 gap-2 items-center bg-white dark:bg-navy-700 rounded-2xl ${compact ? 'shadow-sm border border-slate-200 dark:border-navy-600' : 'shadow-xl border border-slate-100 dark:border-navy-600'
                } px-4`}>
                <HiSearch className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Job title, keyword, or company"
                    className="flex-1 py-3.5 bg-transparent focus:outline-none text-navy-800 dark:text-slate-100 placeholder-slate-400 text-sm"
                />
                <div className="w-px h-5 bg-slate-200 dark:bg-navy-600 hidden sm:block" />
                <HiLocationMarker className="w-5 h-5 text-slate-400 flex-shrink-0 hidden sm:block" />
                <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, state, or remote"
                    className="flex-1 py-3.5 bg-transparent focus:outline-none text-navy-800 dark:text-slate-100 placeholder-slate-400 text-sm hidden sm:block"
                />
            </div>
            <motion.button type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-6 py-3.5 rounded-2xl justify-center whitespace-nowrap">
                <HiSearch className="w-4 h-4" />
                Search Jobs
            </motion.button>
        </form>
    );
}
