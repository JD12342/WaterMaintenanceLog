import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ConsumerDashboard({ auth }) {
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
            <Head title="My Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">My Dashboard</h2>
                            <p className="text-gray-600 mt-1">Welcome back, {auth.user.name}</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Total Complaints</div>
                                <div className="text-3xl font-bold text-blue-600 mt-2">
                                    {dashboardData?.stats?.total_complaints || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Pending</div>
                                <div className="text-3xl font-bold text-yellow-600 mt-2">
                                    {dashboardData?.stats?.pending || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Approved</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">
                                    {dashboardData?.stats?.approved || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Completed</div>
                                <div className="text-3xl font-bold text-purple-600 mt-2">
                                    {dashboardData?.stats?.completed || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <Link
                                href="/complaints/create"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block font-medium transition"
                            >
                                + Submit New Complaint
                            </Link>
                        </div>
                    </div>

                    {/* My Complaints */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">My Recent Complaints</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.my_complaints?.map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{complaint.id}</td>
                                                <td className="px-6 py-4 text-sm">{complaint.description.substring(0, 60)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        complaint.status === 'submitted_to_engineering' ? 'bg-blue-100 text-blue-800' :
                                                        complaint.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        complaint.status === 'declined' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {complaint.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                        complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {complaint.priority || 'normal'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {new Date(complaint.submitted_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {complaint.work_order ? (
                                                        <Link 
                                                            href={`/work-orders/${complaint.work_order.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View WO #{complaint.work_order.id}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!dashboardData?.my_complaints || dashboardData.my_complaints.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No complaints submitted yet</p>
                                        <Link href="/complaints/create" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                                            Submit your first complaint
                                        </Link>
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
