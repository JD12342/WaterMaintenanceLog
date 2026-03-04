import { useState } from 'react';
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const STATUS_BADGES = {
    created: 'bg-blue-100 text-blue-800',
    assigned: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-emerald-100 text-emerald-800'
};

export default function WorkOrdersList({ workOrders = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewWorkOrder, setViewWorkOrder] = useState(null);

    const filteredWorkOrders = workOrders.filter(wo => {
        const matchSearch =
            wo.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.complaint?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.assigned_to_user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || wo.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input type="text" placeholder="Search work orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
                        <option value="all">All Status</option>
                        <option value="created">Created</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="verified">Verified</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['WO Number', 'Complaint', 'Assigned To', 'Status', 'Created', 'Due Date', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredWorkOrders.map(wo => (
                                <tr key={wo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wo.work_order_number}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{wo.complaint?.title?.substring(0, 50)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{wo.assigned_to_user?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[wo.status] || 'bg-gray-100 text-gray-800'}`}>{wo.status?.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wo.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wo.estimated_completion_date ? new Date(wo.estimated_completion_date).toLocaleDateString() : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => setViewWorkOrder(wo)} className="text-blue-600 hover:text-blue-900"><EyeIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredWorkOrders.length === 0 && <p className="text-center py-8 text-gray-400">No work orders found.</p>}
                </div>
            </div>

            {viewWorkOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Work Order Details</h3>
                            <button onClick={() => setViewWorkOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div><dt className="font-medium text-gray-600">WO Number</dt><dd className="text-gray-900">{viewWorkOrder.work_order_number}</dd></div>
                            <div><dt className="font-medium text-gray-600">Complaint</dt><dd className="text-gray-900">{viewWorkOrder.complaint?.title}</dd></div>
                            <div><dt className="font-medium text-gray-600">Assigned To</dt><dd className="text-gray-900">{viewWorkOrder.assigned_to_user?.name || '—'}</dd></div>
                            <div><dt className="font-medium text-gray-600">Status</dt>
                                <dd><span className={`px-2 py-1 text-xs rounded-full ${STATUS_BADGES[viewWorkOrder.status]}`}>{viewWorkOrder.status?.replace(/_/g, ' ')}</span></dd>
                            </div>
                            <div><dt className="font-medium text-gray-600">Notes</dt><dd className="text-gray-900">{viewWorkOrder.notes || '—'}</dd></div>
                        </dl>
                        <button onClick={() => setViewWorkOrder(null)} className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
