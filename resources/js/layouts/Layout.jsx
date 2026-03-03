import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { logout } from '@/utils/auth';

export default function Layout({ children, title = 'Water Maintenance Log', user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const navigation = user ? [
        { name: 'Dashboard', href: '/dashboard', icon: '🏠', roles: ['ADMIN', 'ENGINEERING', 'MAINTENANCE', 'CONSUMER'] },
        { name: 'Submit Complaint', href: '/complaints/submit', icon: '📝', roles: ['CONSUMER'] },
        { name: 'My Complaints', href: '/complaints', icon: '📋', roles: ['CONSUMER'] },
        { name: 'Manage Complaints', href: '/complaints', icon: '🔧', roles: ['ADMIN', 'ENGINEERING'] },
        { name: 'Work Orders', href: '/work-orders', icon: '📋', roles: ['ADMIN', 'ENGINEERING', 'MAINTENANCE'] },
        { name: 'My Work', href: '/maintenance/my-work', icon: '🔨', roles: ['MAINTENANCE'] },
        { name: 'Maintenance Reports', href: '/maintenance-reports', icon: '📊', roles: ['ADMIN', 'ENGINEERING', 'MAINTENANCE'] },
        { name: 'Submit Report', href: '/maintenance-reports/create', icon: '📝', roles: ['MAINTENANCE'] },
        { name: 'Engineering Review', href: '/engineering/review', icon: '🔍', roles: ['ENGINEERING'] },
        { name: 'Manage Users', href: '/admin/users', icon: '👥', roles: ['ADMIN'] },
    ].filter(item => item.roles.includes(user.role)) : [];

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                        💧 Water Maintenance System
                                    </Link>
                                </div>
                                
                                {/* Desktop navigation */}
                                {user && (
                                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                                        {navigation.slice(0, 4).map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            >
                                                <span className="mr-2">{item.icon}</span>
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Right side */}
                            <div className="flex items-center space-x-4">
                                {/* User menu */}
                                {user ? (
                                    <div className="relative inline-flex items-center space-x-4">
                                        <span className="text-sm text-gray-700">
                                            {user.name} ({user.role})
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-x-2">
                                        <Link
                                            href="/login"
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                                
                                {/* Mobile menu button */}
                                {user && (
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                    >
                                        <span className="text-xl">☰</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile navigation */}
                    {user && sidebarOpen && (
                        <div className="md:hidden">
                            <div className="pt-2 pb-3 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Breadcrumb */}
                {user && (
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
                                <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                                <span>•</span>
                                <span className="font-medium text-gray-900">
                                    {title.replace('Water Maintenance Log - ', '')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <main>{children}</main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-8">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-sm text-gray-500">
                            <p>&copy; 2026 Water Maintenance System. Built with Laravel + React.</p>
                            {process.env.NODE_ENV === 'development' && (
                                <p className="mt-1">
                                    <a
                                        href="/api/health"
                                        className="text-blue-600 hover:text-blue-800"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        API Health Check
                                    </a>
                                    {' | '}
                                    <a
                                        href="/api/v1/status"
                                        className="text-blue-600 hover:text-blue-800"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        API Status
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}