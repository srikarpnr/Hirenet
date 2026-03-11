/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    50: '#ECEFFE',
                    100: '#D9DFFD',
                    200: '#B3BFFB',
                    300: '#8D9FF9',
                    400: '#677FF7',
                    500: '#4F46E5',
                    600: '#3A32D1',
                    700: '#2B25B0',
                    800: '#1E198E',
                    900: '#120F6C',
                },
                navy: {
                    DEFAULT: '#0F172A',
                    50: '#F1F5F9',
                    100: '#E2E8F0',
                    200: '#CBD5E1',
                    300: '#94A3B8',
                    400: '#64748B',
                    500: '#475569',
                    600: '#334155',
                    700: '#1E293B',
                    800: '#0F172A',
                    900: '#020617',
                },
                accent: {
                    DEFAULT: '#22C55E',
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    500: '#22C55E',
                    600: '#16A34A',
                    700: '#15803D',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Poppins', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 24px rgba(0,0,0,0.08)',
                'card-hover': '0 8px 40px rgba(0,0,0,0.14)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
