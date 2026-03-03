import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '../layouts/Layout';
import axios from 'axios';

const StatCard = ({ title, value, color = 'blue', icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={`text-${color}-600 text-2xl`}>
                        {icon}
                    </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className={`text-lg font-medium text-${color}-600`}>{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'reviewed': 'bg-blue-100 text-blue-800',
            'submitted_to_engineering': 'bg-purple-100 text-purple-800',
            'approved': 'bg-green-100 text-green-800',
            'declined': 'bg-red-100 text-red-800',
            'assigned': 'bg-indigo-100 text-indigo-800',
            'in_progress': 'bg-orange-100 text-orange-800',
            'completed': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};

export default function Dashboard({ auth }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/v1/workflow-dashboard');
            setDashboardData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout user={auth.user}>
                <Head title="Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center">Loading dashboard...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    const renderConsumerDashboard = () => (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard
                    title="Total Complaints"
                    value={dashboardData.complaints_count || 0}
                    color="blue"
                    icon="📋"
                />
                <StatCard
                    title="Pending Resolution"
                    value={dashboardData.my_complaints?.filter(c => !['completed', 'closed'].includes(c.status)).length || 0}
                    color="yellow"
                    icon="⏳"
                />
                <StatCard
                    title="Resolved"
                    value={dashboardData.my_complaints?.filter(c => ['completed', 'closed'].includes(c.status)).length || 0}
                    color="green"
                    icon="✅"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            href="/complaints/submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Submit New Complaint
                        </Link>
                        <Link
                            href="/complaints"
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-center block"
                        >
                            View My Complaints
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Complaints */}
            {dashboardData.my_complaints && dashboardData.my_complaints.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Complaints</h3>
                        <div className="space-y-3">
                            {dashboardData.my_complaints.slice(0, 5).map((complaint) => (
                                <div key={complaint.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                        <p className="text-xs text-gray-500">📍 {complaint.location}</p>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAdminDashboard = () => (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatCard
                    title="Pending Complaints"
                    value={dashboardData.pending_complaints || 0}
                    color="yellow"
                    icon="📋"
                />
                <StatCard
                    title="Pending Assignments"
                    value={dashboardData.pending_assignments || 0}
                    color="orange"
                    icon="📝"
                />
                <StatCard
                    title="Active Work Orders"
                    value={dashboardData.active_work_orders || 0}
                    color="blue"
                    icon="🔧"
                />
                <StatCard
                    title="Completed This Month"
                    value={dashboardData.completed_this_month || 0}
                    color="green"
                    icon="✅"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                            href="/complaints"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Manage Complaints
                        </Link>
                        <Link
                            href="/work-orders"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Manage Work Orders
                        </Link>
                        <Link
                            href="/maintenance-reports"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            View Reports
                        </Link>
                        <Link
                            href="/users"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Manage Users
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Complaints */}
            {dashboardData.recent_complaints && dashboardData.recent_complaints.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Complaints</h3>
                        <div className="space-y-3">
                            {dashboardData.recent_complaints.slice(0, 5).map((complaint) => (
                                <div key={complaint.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                        <p className="text-xs text-gray-500">
                                            by {complaint.user?.name} • 📍 {complaint.location}
                                        </p>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderEngineeringDashboard = () => (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard
                    title="Pending Reviews"
                    value={dashboardData.pending_reviews || 0}
                    color="yellow"
                    icon="🔍"
                />
                <StatCard
                    title="Approved This Month"
                    value={dashboardData.approved_this_month || 0}
                    color="green"
                    icon="✅"
                />
                <StatCard
                    title="Total Reviews"
                    value={(dashboardData.pending_reviews || 0) + (dashboardData.approved_this_month || 0)}
                    color="blue"
                    icon="📊"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Engineering Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                            href="/complaints?status=submitted_to_engineering"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Review Pending Complaints
                        </Link>
                        <Link
                            href="/maintenance-reports"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            View Maintenance Reports
                        </Link>
                    </div>
                </div>
            </div>

            {/* Pending Complaints */}
            {dashboardData.pending_complaints && dashboardData.pending_complaints.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pending Engineering Review</h3>
                        <div className="space-y-3">
                            {dashboardData.pending_complaints.slice(0, 5).map((complaint) => (
                                <div key={complaint.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                        <p className="text-xs text-gray-500">
                                            by {complaint.user?.name} • 📍 {complaint.location}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(complaint.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMaintenanceDashboard = () => (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatCard
                    title="Assigned Work"
                    value={dashboardData.my_assigned_work || 0}
                    color="blue"
                    icon="🔧"
                />
                <StatCard
                    title="Completed This Month"
                    value={dashboardData.completed_this_month || 0}
                    color="green"
                    icon="✅"
                />
                <StatCard
                    title="Pending Reports"
                    value={dashboardData.pending_reports || 0}
                    color="orange"
                    icon="📝"
                />
                <StatCard
                    title="Total Active"
                    value={dashboardData.my_assigned_work || 0}
                    color="purple"
                    icon="⚡"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Maintenance Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                            href="/work-orders"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            View My Work Orders
                        </Link>
                        <Link
                            href="/maintenance-reports/create"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center block"
                        >
                            Submit Report
                        </Link>
                    </div>
                </div>
            </div>

            {/* My Work Orders */}
            {dashboardData.my_work_orders && dashboardData.my_work_orders.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Active Work Orders</h3>
                        <div className="space-y-3">
                            {dashboardData.my_work_orders.slice(0, 5).map((workOrder) => (
                                <div key={workOrder.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{workOrder.complaint?.title}</p>
                                        <p className="text-xs text-gray-500">
                                            Due: {workOrder.estimated_completion_date ? new Date(workOrder.estimated_completion_date).toLocaleDateString() : 'No date set'}
                                        </p>
                                    </div>
                                    <StatusBadge status={workOrder.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDashboardByRole = () => {
        switch (auth.user.role) {
            case 'CONSUMER':
                return renderConsumerDashboard();
            case 'ADMIN':
                return renderAdminDashboard();
            case 'ENGINEERING':
                return renderEngineeringDashboard();
            case 'MAINTENANCE':
                return renderMaintenanceDashboard();
            default:
                return <div>Invalid user role</div>;
        }
    };

    return (
        <Layout user={auth.user}>
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {auth.user.name}!
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {auth.user.role} Dashboard • {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Role-specific dashboard content */}
                    {renderDashboardByRole()}
                </div>
            </div>
        </Layout>
    );
}