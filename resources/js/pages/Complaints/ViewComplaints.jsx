import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../../layouts/Layout';
import axios from 'axios';

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

const PriorityBadge = ({ priority }) => {
    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'bg-gray-100 text-gray-800',
            'normal': 'bg-blue-100 text-blue-800',
            'high': 'bg-yellow-100 text-yellow-800', 
            'urgent': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
            {priority.toUpperCase()}
        </span>
    );
};

export default function ViewComplaints({ auth }) {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, [filter]);

    const fetchComplaints = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await axios.get('/api/complaints', { params });
            setComplaints(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setLoading(false);
        }
    };

    const handleComplaintAction = async (complaintId, action, data = {}) => {
        try {
            await axios.post(`/api/complaints/${complaintId}/${action}`, data);
            fetchComplaints(); // Refresh the list
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            alert(`Failed to ${action}. Please try again.`);
        }
    };

    const ComplaintActions = ({ complaint }) => {
        const userRole = auth.user.role;
        
        if (userRole === 'ADMIN') {
            if (complaint.status === 'pending') {
                return (
                    <div className="space-x-2">
                        <button
                            onClick={() => handleComplaintAction(complaint.id, 'update', { status: 'reviewed' })}
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                        >
                            Mark Reviewed
                        </button>
                    </div>
                );
            } else if (complaint.status === 'reviewed') {
                return (
                    <button
                        onClick={() => handleComplaintAction(complaint.id, 'submit-to-engineering')}
                        className="bg-purple-500 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded"
                    >
                        Submit to Engineering
                    </button>
                );
            }
        } else if (userRole === 'ENGINEERING') {
            if (complaint.status === 'submitted_to_engineering') {
                return (
                    <div className="space-x-2">
                        <button
                            onClick={() => {
                                const assessment = prompt('Enter damage assessment:');
                                if (assessment) {
                                    handleComplaintAction(complaint.id, 'approve', { damage_assessment: assessment });
                                }
                            }}
                            className="bg-green-500 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => {
                                const assessment = prompt('Enter reason for decline:');
                                if (assessment) {
                                    handleComplaintAction(complaint.id, 'decline', { damage_assessment: assessment });
                                }
                            }}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                        >
                            Decline
                        </button>
                    </div>
                );
            }
        }
        
        return null;
    };

    if (loading) {
        return (
            <Layout user={auth.user}>
                <Head title="View Complaints" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center">Loading complaints...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={auth.user}>
            <Head title="View Complaints" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {auth.user.role === 'CONSUMER' ? 'My Complaints' : 'All Complaints'}
                                </h1>
                                
                                {/* Status Filter */}
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="submitted_to_engineering">In Engineering Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="declined">Declined</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Complaints Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title & Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Submitted
                                            </th>
                                            {auth.user.role !== 'CONSUMER' && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Submitted By
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {complaints.map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {complaint.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            📍 {complaint.location}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <PriorityBadge priority={complaint.priority} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={complaint.status} />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(complaint.submitted_at).toLocaleDateString()}
                                                </td>
                                                {auth.user.role !== 'CONSUMER' && (
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {complaint.user?.name || 'N/A'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setSelectedComplaint(complaint)}
                                                            className="bg-gray-500 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded"
                                                        >
                                                            View
                                                        </button>
                                                        <ComplaintActions complaint={complaint} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {complaints.length === 0 && (
                                    <div className="text-center py-12">
                                        <h3 className="text-sm font-medium text-gray-900">No complaints found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {filter === 'all' ? 'No complaints have been submitted yet.' : `No complaints with status: ${filter}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaint Detail Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedComplaint.title}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedComplaint.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedComplaint.location}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <div className="mt-1">
                                            <PriorityBadge priority={selectedComplaint.priority} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <div className="mt-1">
                                            <StatusBadge status={selectedComplaint.status} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Submitted</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(selectedComplaint.submitted_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedComplaint.damage_assessment && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Engineering Assessment</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedComplaint.damage_assessment}</p>
                                    </div>
                                )}

                                {selectedComplaint.admin_notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedComplaint.admin_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}