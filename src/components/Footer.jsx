import { Link } from 'react-router-dom';
import { HiBriefcase } from 'react-icons/hi';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const footerLinks = {
    Platform: [
        { label: 'Find Jobs', to: '/jobs' },
        { label: 'Companies', to: '/companies' },
        { label: 'Employer Dashboard', to: '/dashboard' },
        { label: 'Job Seeker Profile', to: '/profile' },
    ],
    Company: [
        { label: 'About Us', to: '#' },
        { label: 'Careers', to: '#' },
        { label: 'Blog', to: '#' },
        { label: 'Press', to: '#' },
    ],
    Legal: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'Terms of Service', to: '#' },
        { label: 'Cookie Policy', to: '#' },
        { label: 'GDPR', to: '#' },
    ],
    Support: [
        { label: 'Help Center', to: '#' },
        { label: 'Contact Us', to: '#' },
        { label: 'Status', to: '#' },
        { label: 'Community', to: '#' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-navy-800 dark:bg-navy-900 text-slate-300 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                                <HiBriefcase className="text-white w-5 h-5" />
                            </div>
                            <span className="font-display font-bold text-xl text-white">
                                Hire<span className="text-primary-400">Net</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Connecting top talent with the world's best companies. Find your dream job today.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            {[
                                { icon: FaGithub, href: '#' },
                                { icon: FaTwitter, href: '#' },
                                { icon: FaLinkedin, href: '#' },
                            ].map(({ icon: Icon, href }, i) => (
                                <a key={i} href={href}
                                    className="w-9 h-9 bg-navy-700 dark:bg-navy-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-all duration-200">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{section}</h4>
                            <ul className="space-y-2.5">
                                {links.map(link => (
                                    <li key={link.label}>
                                        <Link to={link.to}
                                            className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-navy-700 dark:border-navy-600 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">© 2024 HireNet. All rights reserved.</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Built with</span>
                        <span className="text-red-400">♥</span>
                        <span>for job seekers & employers worldwide</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
