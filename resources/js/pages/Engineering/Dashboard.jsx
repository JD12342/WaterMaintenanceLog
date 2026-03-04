import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PendingApprovals from './approvals/PendingApprovals';
import ApprovedList from './approvals/ApprovedList';
import DeclinedList from './approvals/DeclinedList';
import EngineeringReportsList from './reports/ReportsList';
import { 
    HomeIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    CheckIcon,
    CogIcon
} from '@heroicons/react/24/outline';

export default function EngineeringDashboard({ auth }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState('approve');

    const { data, setData, post, processing } = useForm({
        reason: '',
        engineering_assessment: '',
        recommended_materials: '',
        estimated_hours: ''
    });

    useEffect(() => {
        loadDashboard();
        if (currentView === 'pending-approvals') {
            loadPendingApprovals();
        }
    }, [currentView]);

    const loadDashboard = async () => {
        try {
            const response = await window.axios.get('/api/v1/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPendingApprovals = async () => {
        try {
            const response = await window.axios.get('/api/v1/complaints?status=submitted_to_engineering');
            setPendingApprovals(response.data);
        } catch (error) {
            console.error('Error loading pending approvals:', error);
        }
    };

    const handleLogout = () => {
        post('/logout');
    };

    const showApprovalDialog = (complaint, action) => {
        setSelectedComplaint(complaint);
        setApprovalAction(action);
        setShowApprovalModal(true);
        setData({
            reason: '',
            engineering_assessment: '',
            recommended_materials: '',
            estimated_hours: ''
        });
    };

    const submitApproval = async () => {
        if (!selectedComplaint) return;

        try {
            const endpoint = approvalAction === 'approve' 
                ? `/api/v1/complaints/${selectedComplaint.id}/approve`
                : `/api/v1/complaints/${selectedComplaint.id}/decline`;

            await window.axios.post(endpoint, data);
            setShowApprovalModal(false);
            loadPendingApprovals();
        } catch (error) {
            console.error('Error submitting approval:', error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            submitted_to_engineering: 'bg-purple-100 text-purple-800',
            approved: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const Sidebar = () => (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Engineering</h1>
                <p className="text-sm text-gray-500">Water Maintenance</p>
            </div>
            
            <nav className="p-4 space-y-2">
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <HomeIcon className="h-5 w-5 mr-3" />
                    Dashboard
                </button>
                
                <button
                    onClick={() => setCurrentView('pending-approvals')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'pending-approvals' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ClockIcon className="h-5 w-5 mr-3" />
                    Pending Approvals
                </button>
                
                <button
                    onClick={() => setCurrentView('approved')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'approved' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <CheckCircleIcon className="h-5 w-5 mr-3" />
                    Approved Requests
                </button>
                
                <button
                    onClick={() => setCurrentView('declined')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'declined' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <XMarkIcon className="h-5 w-5 mr-3" />
                    Declined Requests
                </button>
                
                <button
                    onClick={() => setCurrentView('reports')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                    Reports
                </button>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                </div>
            </div>
        </div>
    );

    const DashboardView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Engineering Dashboard</h1>
                    <p className="text-gray-600">Review and approve maintenance requests</p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Pending Reviews" 
                    value={dashboardData?.engineering_stats?.pending_reviews || 0}
                    icon={ClockIcon}
                    color="yellow" 
                />
                <StatCard 
                    title="Approved This Week" 
                    value={dashboardData?.engineering_stats?.approved_this_week || 0}
                    icon={CheckCircleIcon}
                    color="green" 
                />
                <StatCard 
                    title="Declined This Week" 
                    value={dashboardData?.engineering_stats?.declined_this_week || 0}
                    icon={XMarkIcon}
                    color="red" 
                />
                <StatCard 
                    title="Total Reviews" 
                    value={dashboardData?.engineering_stats?.total_reviews || 0}
                    icon={CogIcon}
                    color="blue" 
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Reviews</h3>
                    <div className="space-y-3">
                        {pendingApprovals?.slice(0, 5).map((complaint) => (
                            <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{complaint.title}</p>
                                    <p className="text-sm text-gray-600">{complaint.location}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => showApprovalDialog(complaint, 'approve')}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => showApprovalDialog(complaint, 'decline')}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentView('pending-approvals')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View all pending reviews →
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Decisions</h3>
                    <div className="space-y-3">
                        {dashboardData?.engineering_recent_decisions?.slice(0, 5).map((decision) => (
                            <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{decision.complaint?.title}</p>
                                    <p className="text-sm text-gray-600">{decision.action} • {new Date(decision.reviewed_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    decision.action === 'approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {decision.action}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'pending-approvals':
                return <PendingApprovals />;
            case 'approved':
                return <ApprovedList />;
            case 'declined':
                return <DeclinedList />;
            case 'reports':
                return <EngineeringReportsList />;
            default:
                return <DashboardView />;
        }
    };

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="ml-64 flex-1 flex items-center justify-center min-h-screen">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Engineering Dashboard" />
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
}
