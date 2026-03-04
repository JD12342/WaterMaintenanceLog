import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import ConsumerComplaintsList from './complaints/ComplaintsList';
import SubmitComplaintModal from './complaints/SubmitComplaintModal';
import { 
    HomeIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    PlusIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function ConsumerDashboard({ auth, dashboardData, viewData, currentView: serverView }) {
    const currentView = serverView || 'dashboard';
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const { post } = useForm();
    const handleLogout = () => post('/logout');
    const navigateTo = (view) => router.get('/dashboard', { view }, { preserveScroll: true });

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            submitted_to_engineering: 'bg-purple-100 text-purple-800',
            approved: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            assigned: 'bg-indigo-100 text-indigo-800',
            in_progress: 'bg-orange-100 text-orange-800',
            completed: 'bg-emerald-100 text-emerald-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const Sidebar = () => (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-500">Water Maintenance</p>
            </div>
            
            <nav className="p-4 space-y-2">
                <button
                    onClick={() => navigateTo('dashboard')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <HomeIcon className="h-5 w-5 mr-3" />
                    Dashboard
                </button>
                
                <button
                    onClick={() => navigateTo('complaints')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'complaints' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                    My Complaints
                </button>
                
                <button
                    onClick={() => setShowComplaintForm(true)}
                    className="w-full flex items-center px-4 py-3 rounded-lg text-left text-green-600 hover:bg-green-50 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-3" />
                    Submit Complaint
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
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {auth.user.name}</p>
                </div>
                <button
                    onClick={() => setShowComplaintForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Submit New Complaint
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Complaints" 
                    value={dashboardData?.stats?.total_complaints || 0}
                    icon={ExclamationTriangleIcon}
                    color="blue" 
                />
                <StatCard 
                    title="Pending" 
                    value={dashboardData?.stats?.pending || 0}
                    icon={ClockIcon}
                    color="yellow" 
                />
                <StatCard 
                    title="In Progress" 
                    value={dashboardData?.stats?.in_progress || 0}
                    icon={ClockIcon}
                    color="orange" 
                />
                <StatCard 
                    title="Completed" 
                    value={dashboardData?.stats?.completed || 0}
                    icon={CheckCircleIcon}
                    color="green" 
                />
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
                    <button 
                        onClick={() => navigateTo('complaints')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View all →
                    </button>
                </div>
                <div className="space-y-3">
                    {dashboardData?.my_complaints?.slice(0, 5).map((complaint) => (
                        <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{complaint.description?.substring(0, 50)}...</p>
                                <p className="text-sm text-gray-600">{complaint.location} • {new Date(complaint.submitted_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(complaint.status)}`}>
                                    {complaint.status.replace('_', ' ')}
                                </span>
                                <button 
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <EyeIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'complaints':
                return <ConsumerComplaintsList complaints={viewData?.complaints || []} />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <>
            <Head title="Consumer Dashboard" />
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>

            {showComplaintForm && (
                <SubmitComplaintModal
                    onClose={() => setShowComplaintForm(false)}
                    onDone={() => { setShowComplaintForm(false); navigateTo('complaints'); }}
                />
            )}
        </>
    );
}
