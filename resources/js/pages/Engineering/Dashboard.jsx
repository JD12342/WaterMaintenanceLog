import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EngineeringDashboard({ auth }) {
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
            <Head title="Engineering Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Engineering Dashboard</h2>
                            <p className="text-gray-600 mt-1">Review and approve maintenance requests</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Pending Reviews</div>
                                <div className="text-3xl font-bold text-orange-600 mt-2">
                                    {dashboardData?.stats?.pending_reviews || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Approved This Month</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">
                                    {dashboardData?.stats?.approved_this_month || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-gray-500 text-sm uppercase">Declined This Month</div>
                                <div className="text-3xl font-bold text-red-600 mt-2">
                                    {dashboardData?.stats?.declined_this_month || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Complaints for Review */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Complaints Pending Review</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.pending_complaints?.map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{complaint.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.user?.name}</td>
                                                <td className="px-6 py-4 text-sm">{complaint.description.substring(0, 60)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
                                                    <Link
                                                        href={`/engineering/complaints/${complaint.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!dashboardData?.pending_complaints || dashboardData.pending_complaints.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        No pending complaints for review
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recently Approved */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Recently Approved</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData?.recent_approved?.map((complaint) => (
                                            <tr key={complaint.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.id}</td>
                                                <td className="px-6 py-4 text-sm">{complaint.description.substring(0, 60)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {complaint.work_order ? (
                                                        <span className="text-green-600">Created</span>
                                                    ) : (
                                                        <span className="text-gray-400">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {new Date(complaint.updated_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!dashboardData?.recent_approved || dashboardData.recent_approved.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        No recently approved complaints
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
