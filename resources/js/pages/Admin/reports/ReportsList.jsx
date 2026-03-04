import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
};

export default function ReportsList() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const response = await window.axios.get('/api/v1/maintenance-reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchSearch =
            r.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.work_order?.complaint?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (loading) return <div className="text-center py-12 text-gray-500">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
                <span className="text-sm text-gray-500">{reports.length} total reports</span>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Work Order', 'Description', 'Technician', 'Hours', 'Quality', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{report.work_order_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{report.work_description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.hours_worked}h</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{report.work_quality}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[report.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {report.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => setSelectedReport(report)} className="text-blue-600 hover:text-blue-900">
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReports.length === 0 && <p className="text-center py-8 text-gray-400">No reports found.</p>}
                </div>
            </div>

            {/* View Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Maintenance Report Details</h3>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium">Work Order:</span> #{selectedReport.work_order_id}</div>
                            <div><span className="font-medium">Technician:</span> {selectedReport.user?.name || 'N/A'}</div>
                            <div><span className="font-medium">Hours Worked:</span> {selectedReport.hours_worked}</div>
                            <div><span className="font-medium">Work Quality:</span> {selectedReport.work_quality}</div>
                            <div><span className="font-medium">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${STATUS_BADGES[selectedReport.status]}`}>
                                    {selectedReport.status?.replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium block mb-1">Work Description:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReport.work_description}</p>
                            </div>
                            {selectedReport.materials_used && (
                                <div>
                                    <span className="font-medium block mb-1">Materials Used:</span>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReport.materials_used}</p>
                                </div>
                            )}
                            {selectedReport.completion_notes && (
                                <div>
                                    <span className="font-medium block mb-1">Completion Notes:</span>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReport.completion_notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button onClick={() => setSelectedReport(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
