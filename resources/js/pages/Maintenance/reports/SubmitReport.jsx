import { useState } from 'react';

/**
 * SubmitReport can be used two ways:
 *  1. As a modal overlay — pass `workOrder` + `onClose` + `onDone`
 *  2. As a standalone page section — no props needed (shows full form with work-order selector)
 */
export default function SubmitReport({ workOrder = null, onClose = null, onDone = null }) {
    const [form, setForm] = useState({
        work_order_id: workOrder?.id || '',
        work_description: '',
        materials_used: '',
        hours_worked: '',
        completion_notes: '',
        work_quality: 'good'
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.work_description.trim() || !form.hours_worked) {
            setError('Work description and hours worked are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await window.axios.post('/api/v1/maintenance-reports', form);
            setSuccess(true);
            if (onDone) onDone();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!workOrder && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Order ID *</label>
                    <input type="number" value={form.work_order_id} onChange={e => handleChange('work_order_id', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter work order ID" required />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Description *</label>
                <textarea rows={3} value={form.work_description} onChange={e => handleChange('work_description', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the work performed..." required />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
                <textarea rows={2} value={form.materials_used} onChange={e => handleChange('materials_used', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List materials used..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked *</label>
                    <input type="number" min="0" step="0.5" value={form.hours_worked} onChange={e => handleChange('hours_worked', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Quality</label>
                    <select value={form.work_quality} onChange={e => handleChange('work_quality', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="needs_followup">Needs Follow-up</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                <textarea rows={2} value={form.completion_notes} onChange={e => handleChange('completion_notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional notes..." />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">Report submitted successfully!</p>}

            <div className="flex justify-end gap-3 pt-2">
                {onClose && (
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                )}
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </form>
    );

    // Modal mode
    if (onClose) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Submit Maintenance Report</h3>
                            {workOrder && <p className="text-sm text-gray-500">Work Order #{workOrder.id} — {workOrder.complaint?.title}</p>}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    // Standalone page section mode
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Submit Report</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {formContent}
            </div>
        </div>
    );
}
