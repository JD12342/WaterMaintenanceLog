import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function SubmitComplaintModal({ onClose, onDone }) {
    const [form, setForm] = useState({
        title: '',
        location: '',
        priority: 'normal',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
            setError('Title, location, and description are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        router.post('/dashboard/complaints', form, {
            onSuccess: () => onDone(),
            onError: (errors) => {
                setError(Object.values(errors).flat().join(' ') || 'Failed to submit complaint.');
                setSubmitting(false);
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Submit a Complaint</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Water pipe leaking on Main St." required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Street address or area description" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select value={form.priority} onChange={e => handleChange('priority', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="low">Low — Minor inconvenience</option>
                            <option value="medium">Medium — Needs attention soon</option>
                            <option value="high">High — Significant problem</option>
                            <option value="urgent">Urgent — Immediate action needed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Please describe the issue in detail..." required />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
