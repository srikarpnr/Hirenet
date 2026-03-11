import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => {
        return localStorage.getItem('hirenet-theme') === 'dark';
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('hirenet-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('hirenet-theme', 'light');
        }
    }, [dark]);

    const toggleDark = () => setDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ dark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
