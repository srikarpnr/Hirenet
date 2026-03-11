import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    // Restore session from localStorage token on app load
    useEffect(() => {
        const token = localStorage.getItem('hirenet-token');
        if (token) {
            authAPI.me()
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('hirenet-token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        localStorage.setItem('hirenet-token', res.data.token);
        setUser(res.data.user);
        setAuthModalOpen(false);
        toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
        return res.data.user;
    };

    const register = async (name, email, password, role, extras = {}) => {
        const res = await authAPI.register({ name, email, password, role, ...extras });
        localStorage.setItem('hirenet-token', res.data.token);
        setUser(res.data.user);
        setAuthModalOpen(false);
        toast.success(`Welcome to HireNet, ${res.data.user.name.split(' ')[0]}! 🎉`);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('hirenet-token');
        setUser(null);
        toast.success('Logged out successfully.');
    };

    const openAuth = (mode = 'login') => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, logout,
            authModalOpen, setAuthModalOpen,
            authMode, setAuthMode, openAuth,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
