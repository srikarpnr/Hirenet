import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { jobsAPI, appsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const JobsContext = createContext();

export function JobsProvider({ children }) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [savedJobs, setSavedJobs] = useState(() => {
        try { return JSON.parse(localStorage.getItem('hirenet-saved') || '[]'); } catch { return []; }
    });
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    // Fetch jobs
    const fetchJobs = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const res = await jobsAPI.getAll(params);
            setJobs(res.data.jobs);
            setTotal(res.data.total);
        } catch (err) {
            toast.error('Failed to load jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Fetch user's applied job IDs
    useEffect(() => {
        if (user?.role === 'user') {
            appsAPI.getMyApplications()
                .then(res => setAppliedJobIds(res.data.map(a => a.job?._id || a.job)))
                .catch(() => { });
        } else {
            setAppliedJobIds([]);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('hirenet-saved', JSON.stringify(savedJobs));
    }, [savedJobs]);

    const toggleSave = (jobId) => {
        setSavedJobs(prev => {
            if (prev.includes(jobId)) {
                toast.success('Job removed from saved');
                return prev.filter(id => id !== jobId);
            } else {
                toast.success('Job saved! ✨');
                return [...prev, jobId];
            }
        });
    };

    const markApplied = (jobId) => {
        setAppliedJobIds(prev => [...prev, jobId]);
        setJobs(prev => prev.map(j =>
            (j._id === jobId || j.id === jobId)
                ? { ...j, applicationCount: (j.applicationCount || 0) + 1 }
                : j
        ));
    };

    const addJob = async (jobData) => {
        const res = await jobsAPI.create(jobData);
        setJobs(prev => [res.data, ...prev]);
        toast.success('Job posted successfully! 🎉');
        return res.data;
    };

    const deleteJob = async (jobId) => {
        await jobsAPI.remove(jobId);
        setJobs(prev => prev.filter(j => (j._id || j.id) !== jobId));
        toast.success('Job deleted.');
    };

    const isSaved = (jobId) => savedJobs.includes(jobId);
    const isApplied = (jobId) => appliedJobIds.includes(jobId);
    const getSavedJobsList = () => jobs.filter(j => savedJobs.includes(j._id || j.id));

    return (
        <JobsContext.Provider value={{
            jobs, loading, total, fetchJobs,
            savedJobs, appliedJobIds,
            toggleSave, markApplied,
            addJob, deleteJob,
            isSaved, isApplied, getSavedJobsList,
        }}>
            {children}
        </JobsContext.Provider>
    );
}

export const useJobs = () => useContext(JobsContext);
