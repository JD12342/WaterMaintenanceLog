import { useState } from 'react';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
};

export default function EngineeringReportsList({ reports = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = reports.filter(r =>
        r.work_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
                <span className="text-sm text-gray-500">{reports.length} total</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="text" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Work Order', 'Technician', 'Description', 'Hours', 'Quality', 'Date', ''].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{r.work_order_id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{r.reported_by_user?.name || r.user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.work_description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{r.hours_worked}h</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{r.work_quality}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.reported_at || r.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelected(r)} className="text-blue-600 hover:text-blue-900"><EyeIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No reports found.</p>}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Report — Work Order #{selected.work_order_id}</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium">Technician:</span> {selected.reported_by_user?.name || selected.user?.name || 'N/A'}</div>
                            <div><span className="font-medium">Hours Worked:</span> {selected.hours_worked}</div>
                            <div><span className="font-medium">Work Quality:</span> {selected.work_quality}</div>
                            <div><span className="font-medium">Work Description:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.work_description}</p>
                            </div>
                            {selected.completion_notes && <div><span className="font-medium">Completion Notes:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.completion_notes}</p>
                            </div>}
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
