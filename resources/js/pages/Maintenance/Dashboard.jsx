import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MaintenanceDashboard({ auth }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await axios.get('/api/v1/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout user={auth.user}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={auth.user}>
            <Head title="Maintenance Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Maintenance Dashboard</h2>
                            <p className="text-gray-600 mt-1">Your assigned work orders</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Assigned Work</div>
                                <div className="text-3xl font-bold text-blue-600 mt-2">
                                    {dashboardData?.stats?.my_assigned_work || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Completed This Month</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">
                                    {dashboardData?.stats?.completed_this_month || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Reports Pending</div>
                                <div className="text-3xl font-bold text-orange-600 mt-2">
                                    {dashboardData?.stats?.pending_reports || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Active Work Orders */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">My Active Work Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.my_work_orders?.map((workOrder) => (
                                            <tr key={workOrder.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{workOrder.id}</td>
                                                <td className="px-6 py-4 text-sm">{workOrder.complaint?.description.substring(0, 50)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{workOrder.complaint?.user?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        workOrder.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                        workOrder.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {workOrder.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {workOrder.estimated_completion_date ? 
                                                        new Date(workOrder.estimated_completion_date).toLocaleDateString() : 
                                                        'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={`/maintenance/work-orders/${workOrder.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        {workOrder.status === 'assigned' ? 'Start Work' : 'View'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!dashboardData?.my_work_orders || dashboardData.my_work_orders.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        No active work orders assigned
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Completed Work Orders */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Recently Completed</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.completed_work_orders?.map((workOrder) => (
                                            <tr key={workOrder.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{workOrder.id}</td>
                                                <td className="px-6 py-4 text-sm">{workOrder.complaint?.description.substring(0, 50)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {workOrder.actual_completion_date ? 
                                                        new Date(workOrder.actual_completion_date).toLocaleDateString() : 
                                                        'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {workOrder.maintenance_report ? (
                                                        <span className="text-green-600 text-sm">✓ Submitted</span>
                                                    ) : (
                                                        <span className="text-orange-600 text-sm">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {workOrder.maintenance_report ? (
                                                        <Link
                                                            href={`/maintenance/reports/${workOrder.maintenance_report.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View Report
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href={`/maintenance/work-orders/${workOrder.id}/report`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Submit Report
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!dashboardData?.completed_work_orders || dashboardData.completed_work_orders.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        No completed work orders
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
