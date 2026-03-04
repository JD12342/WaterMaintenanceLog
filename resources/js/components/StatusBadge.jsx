const StatusBadge = ({ status, priority = null, type = 'status' }) => {
    const getStatusBadge = (status) => {
        const badges = {
            // Complaint statuses
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            submitted_to_engineering: 'bg-purple-100 text-purple-800',
            approved: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            
            // Work order statuses
            assigned: 'bg-indigo-100 text-indigo-800',
            in_progress: 'bg-orange-100 text-orange-800',
            completed: 'bg-emerald-100 text-emerald-800',
            closed: 'bg-gray-100 text-gray-800',
            
            // General statuses
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            suspended: 'bg-yellow-100 text-yellow-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            normal: 'bg-blue-100 text-blue-800',
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800'
        };
        return badges[priority] || 'bg-gray-100 text-gray-800';
    };

    const formatDisplayText = (text) => {
        if (!text) return '';
        return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (type === 'priority' && priority) {
        return (
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityBadge(priority)}`}>
                {formatDisplayText(priority)}
            </span>
        );
    }

    return (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(status)}`}>
            {formatDisplayText(status)}
        </span>
    );
};

export default StatusBadge;