import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ApprovalModal from './ApprovalModal';

const PRIORITY_BADGES = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

export default function PendingApprovals({ complaints = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeComplaint, setActiveComplaint] = useState(null);

    const filtered = complaints.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    {complaints.length} pending
                </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="text" placeholder="Search complaints..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(complaint => (
                    <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400 font-mono">#{complaint.id}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGES[complaint.priority] || 'bg-gray-100 text-gray-800'}`}>
                                        {complaint.priority}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">{complaint.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                    <span>Location: {complaint.location}</span>
                                    <span>Submitted: {new Date(complaint.created_at).toLocaleDateString()}</span>
                                    {complaint.user && <span>By: {complaint.user.name}</span>}
                                </div>
                            </div>
                            <button onClick={() => setActiveComplaint(complaint)}
                                className="ml-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 whitespace-nowrap">
                                Review
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                        No pending approvals.
                    </div>
                )}
            </div>

            {activeComplaint && (
                <ApprovalModal
                    complaint={activeComplaint}
                    onClose={() => setActiveComplaint(null)}
                />
            )}
        </div>
    );
}
