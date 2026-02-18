import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    BarChart3,
    Brain,
    Sliders,
    FileText,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
        { name: 'Garden Setup', href: '/app/setup', icon: Settings },
        { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
        { name: 'AI Insights', href: '/app/insights', icon: Brain },
        { name: 'Control Panel', href: '/app/control', icon: Sliders },
        { name: 'Reports', href: '/app/reports', icon: FileText },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/10">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Garden OS</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href || (item.href !== '/app' && location.pathname.startsWith(item.href));
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'}
                  `} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                GM
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Govind Mehta</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Pro Plan</p>
                            </div>
                            <LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Header = ({ toggleSidebar }) => {
    return (
        <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                >
                    <Menu size={20} />
                </button>

                {/* Search Bar - Hidden on mobile */}
                <div className="hidden sm:flex items-center relative max-w-md w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search details..."
                        className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-black transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Weather Widget (Mock) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-500/20">
                    <span>☀️ 31°C</span>
                    <span className="w-px h-3 bg-blue-200 dark:bg-blue-500/30"></span>
                    <span>Humidity 60%</span>
                </div>

                {/* Garden Health Score */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Health Score: 82%
                </div>

                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></span>
                </button>
            </div>
        </header>
    );
};

const GardenLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GardenLayout;
