import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';

const Home = lazy(() => import('./pages/Home'));
const JobListings = lazy(() => import('./pages/JobListings'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const JobSeekerProfile = lazy(() => import('./pages/JobSeekerProfile'));
const Companies = lazy(() => import('./pages/Companies'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading HireNet...</p>
            </div>
        </div>
    );
}

// Smart redirect based on role
function DashboardRedirect() {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/" />;
    if (user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'manager') return <EmployerDashboard />;
    return <Navigate to="/profile" />;
}

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<PageLoader />}>
                    <Routes location={location}>
                        <Route path="/" element={<Home />} />
                        <Route path="/jobs" element={<JobListings />} />
                        <Route path="/jobs/:id" element={<JobDetails />} />
                        <Route path="/dashboard" element={<DashboardRedirect />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/profile" element={<JobSeekerProfile />} />
                        <Route path="/companies" element={<Companies />} />
                        <Route path="*" element={
                            <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-navy-900">
                                <div className="text-center">
                                    <div className="text-8xl font-display font-black text-slate-200 dark:text-navy-700">404</div>
                                    <h2 className="font-display font-bold text-navy-800 dark:text-white text-2xl mt-4 mb-2">Page Not Found</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
                                    <a href="/" className="btn-primary">Go Home</a>
                                </div>
                            </div>
                        } />
                    </Routes>
                </Suspense>
            </motion.div>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <JobsProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-slate-50 dark:bg-navy-900 transition-colors duration-300">
                            <Navbar />
                            <AnimatedRoutes />
                            <Footer />
                            <AuthModal />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 3000,
                                    style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                                    success: { style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }, iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                                    error: { style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                                }}
                            />
                        </div>
                    </BrowserRouter>
                </JobsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
