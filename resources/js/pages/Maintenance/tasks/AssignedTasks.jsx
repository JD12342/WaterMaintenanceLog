import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import SubmitReport from '../reports/SubmitReport';

const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    assigned: 'bg-purple-100 text-purple-800'
};

const PRIORITY_BADGES = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

export default function AssignedTasks({ tasks = [] }) {
    const [reportTask, setReportTask] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const startWork = (taskId) => {
        setActionLoading(taskId);
        router.post(`/dashboard/work-orders/${taskId}/start`, {}, {
            preserveScroll: true,
            onFinish: () => setActionLoading(null),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Assigned Tasks</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{tasks.length} tasks</span>
            </div>

            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400 font-mono">WO #{task.id}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGES[task.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                    {task.complaint?.priority && (
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGES[task.complaint.priority]}`}>
                                            {task.complaint.priority}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">{task.complaint?.title || 'Work Order #' + task.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">{task.complaint?.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                    {task.complaint?.location && <span>Location: {task.complaint.location}</span>}
                                    {task.scheduled_date && <span>Scheduled: {new Date(task.scheduled_date).toLocaleDateString()}</span>}
                                </div>
                                {task.instructions && (
                                    <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
                                        Instructions: {task.instructions}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 min-w-fit">
                                {task.status === 'assigned' && (
                                    <button
                                        onClick={() => startWork(task.id)}
                                        disabled={actionLoading === task.id}
                                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <ClockIcon className="h-4 w-4" />
                                        {actionLoading === task.id ? 'Starting...' : 'Start Work'}
                                    </button>
                                )}
                                {task.status === 'in_progress' && (
                                    <button
                                        onClick={() => setReportTask(task)}
                                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Complete & Report
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                        No tasks assigned to you yet.
                    </div>
                )}
            </div>

            {reportTask && (
                <SubmitReport
                    workOrder={reportTask}
                    onClose={() => setReportTask(null)}
                    onDone={() => { setReportTask(null); router.get('/dashboard', { view: 'assigned-tasks' }, { preserveScroll: true }); }}
                />
            )}
        </div>
    );
}
