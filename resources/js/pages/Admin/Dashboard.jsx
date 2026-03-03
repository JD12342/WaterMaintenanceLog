import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard({ auth }) {
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
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                            <p className="text-gray-600 mt-1">Welcome, {auth.user.name}</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Pending Complaints</div>
                                <div className="text-3xl font-bold text-blue-600 mt-2">
                                    {dashboardData?.stats?.pending_complaints || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Pending Assignments</div>
                                <div className="text-3xl font-bold text-yellow-600 mt-2">
                                    {dashboardData?.stats?.pending_assignments || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Active Work Orders</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">
                                    {dashboardData?.stats?.active_work_orders || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Total Users</div>
                                <div className="text-3xl font-bold text-purple-600 mt-2">
                                    {dashboardData?.stats?.total_users || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href="/admin/users/create"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-medium transition"
                                >
                                    + Add New User/Staff
                                </Link>
                                <Link
                                    href="/admin/complaints"
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-center font-medium transition"
                                >
                                    View All Complaints
                                </Link>
                                <Link
                                    href="/admin/work-orders"
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-center font-medium transition"
                                >
                                    Manage Work Orders
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.recent_complaints?.map((complaint) => (
                                            <tr key={complaint.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.user?.name}</td>
                                                <td className="px-6 py-4 text-sm">{complaint.description.substring(0, 50)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        complaint.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(complaint.submitted_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Recent Work Orders */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Active Work Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.recent_work_orders?.map((workOrder) => (
                                            <tr key={workOrder.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{workOrder.id}</td>
                                                <td className="px-6 py-4 text-sm">{workOrder.complaint?.description.substring(0, 40)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{workOrder.assigned_to_user?.name || 'Unassigned'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        workOrder.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                        workOrder.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {workOrder.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {workOrder.estimated_completion_date ? new Date(workOrder.estimated_completion_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
