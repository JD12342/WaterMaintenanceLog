import { useState } from 'react';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const PRIORITY_BADGES = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

export default function ApprovedList({ complaints = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = complaints.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Approved Complaints</h1>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{complaints.length} approved</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['#', 'Title', 'Location', 'Priority', 'Approved On', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{c.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{c.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGES[c.priority] || 'bg-gray-100 text-gray-800'}`}>{c.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.updated_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelected(c)} className="text-blue-600 hover:text-blue-900"><EyeIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No approved complaints found.</p>}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Complaint #{selected.id}</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium">Title:</span> {selected.title}</div>
                            <div><span className="font-medium">Location:</span> {selected.location}</div>
                            <div><span className="font-medium">Priority:</span> {selected.priority}</div>
                            <div><span className="font-medium">Description:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.description}</p>
                            </div>
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
