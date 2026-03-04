import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    ForwardIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    submitted_to_engineering: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    assigned: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800'
};

const PRIORITY_BADGES = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    normal: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800'
};

export default function ComplaintsList({ complaints = [], maintenanceStaff = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [assignTo, setAssignTo] = useState('');
    const [viewComplaint, setViewComplaint] = useState(null);

    const forwardToEngineering = (complaintId) => {
        router.post(`/dashboard/complaints/${complaintId}/forward`, {}, { preserveScroll: true });
    };

    const openAssignModal = (complaint) => {
        setSelectedComplaint(complaint);
        setShowAssignModal(true);
    };

    const assignWorkOrder = () => {
        if (!assignTo) return;
        router.post('/dashboard/work-orders', {
            complaint_id: selectedComplaint.id,
            assigned_to: assignTo
        }, {
            preserveScroll: true,
            onSuccess: () => setShowAssignModal(false),
            onError: (errors) => console.error('Error assigning:', errors),
        });
    };

    const filteredComplaints = complaints.filter(c => {
        const matchSearch =
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted_to_engineering">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Complaint', 'User', 'Location', 'Priority', 'Status', 'Submitted', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredComplaints.map(complaint => (
                                <tr key={complaint.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                        <p className="text-xs text-gray-500">{complaint.description?.substring(0, 60)}...</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${PRIORITY_BADGES[complaint.priority] || 'bg-gray-100 text-gray-800'}`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {complaint.status?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(complaint.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => setViewComplaint(complaint)} className="text-blue-600 hover:text-blue-900" title="View">
                                            <EyeIcon className="h-4 w-4 inline" />
                                        </button>
                                        {complaint.status === 'pending' && (
                                            <button onClick={() => forwardToEngineering(complaint.id)} className="text-green-600 hover:text-green-900" title="Forward to Engineering">
                                                <ForwardIcon className="h-4 w-4 inline" />
                                            </button>
                                        )}
                                        {complaint.status === 'approved' && (
                                            <button onClick={() => openAssignModal(complaint)} className="text-purple-600 hover:text-purple-900" title="Assign to Maintenance">
                                                <PlusIcon className="h-4 w-4 inline" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredComplaints.length === 0 && (
                        <p className="text-center py-8 text-gray-400">No complaints found.</p>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {viewComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Complaint Details</h3>
                            <button onClick={() => setViewComplaint(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div><dt className="font-medium text-gray-600">Title</dt><dd className="text-gray-900">{viewComplaint.title}</dd></div>
                            <div><dt className="font-medium text-gray-600">Description</dt><dd className="text-gray-900">{viewComplaint.description}</dd></div>
                            <div><dt className="font-medium text-gray-600">Location</dt><dd className="text-gray-900">{viewComplaint.location}</dd></div>
                            <div><dt className="font-medium text-gray-600">Submitted by</dt><dd className="text-gray-900">{viewComplaint.user?.name}</dd></div>
                            <div><dt className="font-medium text-gray-600">Status</dt>
                                <dd><span className={`px-2 py-1 text-xs rounded-full ${STATUS_BADGES[viewComplaint.status]}`}>{viewComplaint.status?.replace(/_/g, ' ')}</span></dd>
                            </div>
                        </dl>
                        <button onClick={() => setViewComplaint(null)} className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Close</button>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Assign to Maintenance</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Complaint: <span className="font-medium">{selectedComplaint?.title}</span></p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                                <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Select staff member</option>
                                    {maintenanceStaff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button onClick={assignWorkOrder} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Assign</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
