import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import SubmitComplaintModal from './SubmitComplaintModal';

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
    submitted_to_engineering: 'Engineering Review',
    approved: 'Approved',
    declined: 'Declined',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    closed: 'Closed'
};

const PRIORITY_BADGES = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

export default function ConsumerComplaintsList({ complaints = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <PlusIcon className="h-4 w-4" />
                    New Complaint
                </button>
            </div>

            <div className="space-y-4">
                {complaints.map(complaint => (
                    <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400 font-mono">#{complaint.id}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGES[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[complaint.status] || complaint.status}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGES[complaint.priority] || 'bg-gray-100 text-gray-800'}`}>
                                        {complaint.priority}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">{complaint.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                    <span>Location: {complaint.location}</span>
                                    <span>Submitted: {new Date(complaint.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelected(complaint)} className="text-blue-600 hover:text-blue-900 ml-4">
                                <EyeIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {complaints.length === 0 && (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-lg font-medium mb-2">No complaints yet</p>
                        <p className="text-sm mb-4">Submit a complaint to report a water system issue in your area.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Submit Your First Complaint
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <SubmitComplaintModal
                    onClose={() => setShowModal(false)}
                    onDone={() => { setShowModal(false); router.get('/dashboard', { view: 'complaints' }, { preserveScroll: true }); }}
                />
            )}

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Complaint #{selected.id}</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGES[selected.status]}`}>
                                    {STATUS_LABELS[selected.status] || selected.status}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGES[selected.priority]}`}>
                                    {selected.priority}
                                </span>
                            </div>
                            <div><span className="font-medium">Title:</span> {selected.title}</div>
                            <div><span className="font-medium">Location:</span> {selected.location}</div>
                            <div><span className="font-medium">Submitted:</span> {new Date(selected.created_at).toLocaleDateString()}</div>
                            <div><span className="font-medium">Description:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.description}</p>
                            </div>
                            {selected.status === 'declined' && selected.reason && (
                                <div><span className="font-medium">Decline Reason:</span>
                                    <p className="text-gray-600 bg-red-50 border border-red-100 p-3 rounded-lg mt-1">{selected.reason}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
