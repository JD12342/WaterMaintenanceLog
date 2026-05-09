import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    DocumentArrowUpIcon,
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

const STATUS_LABELS = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    submitted_to_engineering: 'Sent to Engineering',
    approved: 'Approved',
    declined: 'Declined',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    closed: 'Closed'
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
    const [viewComplaint, setViewComplaint] = useState(null);
    const [reportComplaint, setReportComplaint] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('normal');
    const [sendError, setSendError] = useState('');
    const [sending, setSending] = useState(false);
    const [assignComplaint, setAssignComplaint] = useState(null);
    const [assignTo, setAssignTo] = useState('');

    const sendToEngineering = () => {
        setSending(true);
        setSendError('');

        router.post(`/dashboard/complaints/${reportComplaint.id}/forward`, {
            admin_notes: adminNotes,
            priority: selectedPriority,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setReportComplaint(null);
                setAdminNotes('');
                setSelectedPriority('normal');
                setSendError('');
            },
            onError: (errors) => {
                const message = errors.message || errors.priority || errors.admin_notes || 'Failed to send complaint to engineering.';
                setSendError(Array.isArray(message) ? message.join(' ') : message);
            },
            onFinish: () => setSending(false),
        });
    };

    const assignWorkOrder = () => {
        if (!assignTo) return;
        router.post('/dashboard/work-orders', {
            complaint_id: assignComplaint.id,
            assigned_to: assignTo
        }, {
            preserveScroll: true,
            onSuccess: () => setAssignComplaint(null),
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
            <h1 className="text-2xl font-bold text-slate-800">Complaints Management</h1>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted_to_engineering">Sent to Engineering</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">{filteredComplaints.length} complaints</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-max table-auto divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Complaint', 'Submitted By', 'Location', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredComplaints.map(complaint => (
                                <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-800">{complaint.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{complaint.description?.substring(0, 60)}...</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                                                {complaint.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-slate-700">{complaint.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{complaint.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${PRIORITY_BADGES[complaint.priority] || 'bg-gray-100 text-gray-800'}`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {STATUS_LABELS[complaint.status] || complaint.status?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {new Date(complaint.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setViewComplaint(complaint)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Details">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            {complaint.status === 'pending' && (
                                                <button onClick={() => { setReportComplaint(complaint); setAdminNotes(complaint.admin_notes || ''); setSelectedPriority(complaint.priority || 'normal'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="Send to Engineering">
                                                    <DocumentArrowUpIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {complaint.status === 'approved' && !complaint.work_order && (
                                                <button onClick={() => { setAssignComplaint(complaint); setAssignTo(''); }} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Assign to Maintenance">
                                                    <PlusIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredComplaints.length === 0 && (
                        <p className="text-center py-12 text-slate-400 text-sm">No complaints found.</p>
                    )}
                </div>
            </div>

            {/* View Complaint Modal */}
            {viewComplaint && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Complaint Details</h3>
                            <button onClick={() => setViewComplaint(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</p>
                                <p className="text-slate-800 font-medium">{viewComplaint.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl">{viewComplaint.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                    <p className="text-slate-700">{viewComplaint.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${PRIORITY_BADGES[viewComplaint.priority]}`}>{viewComplaint.priority}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Submitted By</p>
                                    <p className="text-slate-700">{viewComplaint.user?.name}</p>
                                    <p className="text-xs text-slate-400">{viewComplaint.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[viewComplaint.status]}`}>
                                        {STATUS_LABELS[viewComplaint.status] || viewComplaint.status?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                            {viewComplaint.admin_notes && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin Notes</p>
                                    <p className="text-slate-700 bg-blue-50 p-3 rounded-xl">{viewComplaint.admin_notes}</p>
                                </div>
                            )}
                            {viewComplaint.work_order && (
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Order</p>
                                    <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                                        <p className="text-sm"><span className="font-medium">Status:</span> {viewComplaint.work_order.status?.replace(/_/g, ' ')}</p>
                                        {viewComplaint.work_order.assigned_to_user && (
                                            <p className="text-sm"><span className="font-medium">Assigned to:</span> {viewComplaint.work_order.assigned_to_user.name}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setViewComplaint(null)} className="mt-6 w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 font-medium text-sm transition-colors">Close</button>
                    </div>
                </div>
            )}

            {/* Send to Engineering Modal */}
            {reportComplaint && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Send to Engineering</h3>
                            <button onClick={() => { setReportComplaint(null); setSelectedPriority('normal'); setSendError(''); }} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Complaint</p>
                                <p className="text-sm font-medium text-slate-800">{reportComplaint.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{reportComplaint.location} &bull; {selectedPriority} priority</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority Level</label>
                                <p className="text-xs text-slate-500 mb-1.5">Set priority before sending.</p>
                                <select
                                    value={selectedPriority}
                                    onChange={e => setSelectedPriority(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Notes / Assessment</label>
                                <textarea
                                    rows={4}
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Add notes, damage assessment, or recommendations for the engineering team..."
                                />
                            </div>
                            <p className="text-xs text-slate-400">This will forward the complaint to the Engineering department for review and approval.</p>
                            {sendError && (
                                <p className="text-sm text-red-600">{sendError}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => { setReportComplaint(null); setSelectedPriority('normal'); setSendError(''); }} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={sendToEngineering} disabled={sending} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors">
                                {sending ? 'Sending...' : 'Send to Engineering'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign to Maintenance Modal */}
            {assignComplaint && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Assign to Maintenance</h3>
                            <button onClick={() => setAssignComplaint(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Approved Complaint</p>
                                <p className="text-sm font-medium text-slate-800">{assignComplaint.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to Staff Member</label>
                                <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                                    <option value="">Select maintenance staff...</option>
                                    {maintenanceStaff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setAssignComplaint(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={assignWorkOrder} disabled={!assignTo} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
