import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { logout } from '@/utils/auth';

const StatCard = ({ title, value, color = 'blue' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className={`text-2xl font-semibold text-${color}-600`}>{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
);

export default function Dashboard({ auth, stats, role }) {
    const user = auth?.user;

    const handleLogout = () => {
        logout();
    };

    const renderAdminDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total Users" value={stats?.totalUsers || 0} color="blue" />
                <StatCard title="Total Complaints" value={stats?.totalComplaints || 0} color="indigo" />
                <StatCard title="Pending Complaints" value={stats?.pendingComplaints || 0} color="yellow" />
                <StatCard title="Active Work Orders" value={stats?.activeWorkOrders || 0} color="green" />
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/complaints" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        View Complaints
                    </Link>
                    <Link href="/work-orders" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        Work Orders
                    </Link>
                    <Link href="/maintenance-reports" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                        Maintenance Reports
                    </Link>
                </div>
            </div>
        </>
    );

    const renderEngineeringDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                <StatCard title="Pending Review" value={stats?.pendingReview || 0} color="yellow" />
                <StatCard title="Approved This Month" value={stats?.approvedThisMonth || 0} color="green" />
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Engineering Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/complaints" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Review Complaints
                    </Link>
                    <Link href="/work-orders" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        View Work Orders
                    </Link>
                </div>
            </div>
        </>
    );

    const renderMaintenanceDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                <StatCard title="Assigned Work" value={stats?.assignedWork || 0} color="blue" />
                <StatCard title="Completed This Month" value={stats?.completedThisMonth || 0} color="green" />
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/work-orders" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        My Work Orders
                    </Link>
                    <Link href="/maintenance-reports" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        Submit Report
                    </Link>
                </div>
            </div>
        </>
    );

    const renderConsumerDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                <StatCard title="My Complaints" value={stats?.myComplaints || 0} color="blue" />
                <StatCard title="Pending" value={stats?.pendingComplaints || 0} color="yellow" />
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Consumer Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/complaints/submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Submit Complaint
                    </Link>
                    <Link href="/complaints" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        View My Complaints
                    </Link>
                </div>
            </div>
        </>
    );

    const renderDashboardContent = () => {
        switch (role) {
            case 'ADMIN':
                return renderAdminDashboard();
            case 'ENGINEERING':
                return renderEngineeringDashboard();
            case 'MAINTENANCE':
                return renderMaintenanceDashboard();
            default:
                return renderConsumerDashboard();
        }
    };

    const getRoleLabel = () => {
        const labels = {
            'ADMIN': 'Administrator',
            'ENGINEERING': 'Engineering',
            'MAINTENANCE': 'Maintenance Staff',
            'CONSUMER': 'Consumer'
        };
        return labels[role] || role;
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <span className="text-xl font-semibold text-gray-900">
                                    Water Maintenance System
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                    {user?.name} ({getRoleLabel()})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                            Welcome back, {user?.name}!
                        </h1>
                        {renderDashboardContent()}
                    </div>
                </main>
            </div>
        </>
    );
}
