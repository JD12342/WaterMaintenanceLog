import { useState, useEffect } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';

const STATUS_BADGES = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800'
};

export default function TaskHistory() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/v1/maintenance/my-reports');
                setReports(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="text-center py-12 text-gray-500">Loading task history...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Task History</h1>
                <span className="text-sm text-gray-500">{reports.length} reports submitted</span>
            </div>

            <div className="space-y-4">
                {reports.map(report => (
                    <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400 font-mono">WO #{report.work_order_id}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGES[report.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {report.status}
                                    </span>
                                    <span className="text-xs text-gray-400">Quality: {report.work_quality}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{report.work_description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                    <span>Hours: {report.hours_worked}h</span>
                                    <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelected(report)} className="text-blue-600 hover:text-blue-900 ml-4">
                                <EyeIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {reports.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                        No completed tasks yet.
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Report — WO #{selected.work_order_id}</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium">Hours Worked:</span> {selected.hours_worked}</div>
                            <div><span className="font-medium">Work Quality:</span> {selected.work_quality}</div>
                            <div><span className="font-medium">Work Description:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.work_description}</p>
                            </div>
                            {selected.materials_used && <div><span className="font-medium">Materials Used:</span>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selected.materials_used}</p>
                            </div>}
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
