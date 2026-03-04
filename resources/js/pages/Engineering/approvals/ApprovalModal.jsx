import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ApprovalModal({ complaint, onClose }) {
    const [action, setAction] = useState('approve');
    const [form, setForm] = useState({
        reason: '',
        engineering_assessment: '',
        recommended_materials: '',
        estimated_hours: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!form.reason.trim()) {
            setError('Please provide a reason.');
            return;
        }
        setSubmitting(true);
        setError('');
        router.post(`/dashboard/complaints/${complaint.id}/${action}`, form, {
            preserveScroll: true,
            onError: (errors) => {
                setError(errors.message || Object.values(errors).join(', '));
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Review Complaint #{complaint.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                    <p className="font-medium text-gray-900">{complaint.title}</p>
                    <p className="text-gray-500 mt-1">{complaint.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Location: {complaint.location} | Priority: {complaint.priority}</p>
                </div>

                <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
                    <button onClick={() => setAction('approve')}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${action === 'approve' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        Approve
                    </button>
                    <button onClick={() => setAction('decline')}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${action === 'decline' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        Decline
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <textarea rows={2} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder={action === 'approve' ? 'Reason for approval...' : 'Reason for decline...'} />
                    </div>
                    {action === 'approve' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Engineering Assessment</label>
                                <textarea rows={2} value={form.engineering_assessment} onChange={e => setForm(f => ({ ...f, engineering_assessment: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Technical assessment..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Materials</label>
                                <textarea rows={2} value={form.recommended_materials} onChange={e => setForm(f => ({ ...f, recommended_materials: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. PVC pipes, fittings..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                <input type="number" min="0" value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
                            </div>
                        </>
                    )}
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        {submitting ? 'Submitting...' : action === 'approve' ? 'Approve' : 'Decline'}
                    </button>
                </div>
            </div>
        </div>
    );
}
