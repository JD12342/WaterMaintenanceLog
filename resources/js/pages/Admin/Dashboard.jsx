import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ComplaintsList from './complaints/ComplaintsList';
import WorkOrdersList from './work-orders/WorkOrdersList';
import UsersList from './users/UsersList';
import ReportsList from './reports/ReportsList';
import { 
    HomeIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    ForwardIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard({ auth }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [maintenanceStaff, setMaintenanceStaff] = useState([]);

    const { post } = useForm();

    useEffect(() => {
        loadDashboard();
        if (currentView === 'complaints') {
            loadComplaints();
        } else if (currentView === 'work-orders') {
            loadWorkOrders();
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

    const loadComplaints = async () => {
        try {
            const response = await window.axios.get('/api/v1/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error loading complaints:', error);
        }
    };

    const loadWorkOrders = async () => {
        try {
            const response = await window.axios.get('/api/v1/work-orders');
            setWorkOrders(response.data);
        } catch (error) {
            console.error('Error loading work orders:', error);
        }
    };

    const loadMaintenanceStaff = async () => {
        try {
            const response = await window.axios.get('/api/v1/admin/maintenance-staff');
            setMaintenanceStaff(response.data);
        } catch (error) {
            console.error('Error loading maintenance staff:', error);
        }
    };

    const handleLogout = () => {
        post('/logout');
    };

    const forwardToEngineering = async (complaintId) => {
        try {
            await window.axios.post(`/api/v1/complaints/${complaintId}/submit-to-engineering`);
            loadComplaints();
        } catch (error) {
            console.error('Error forwarding to engineering:', error);
        }
    };

    const showAssignmentModal = (complaint) => {
        setSelectedComplaint(complaint);
        loadMaintenanceStaff();
        setShowAssignModal(true);
    };

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
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
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
                    onClick={() => setCurrentView('complaints')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'complaints' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                    Complaints
                </button>
                
                <button
                    onClick={() => setCurrentView('work-orders')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'work-orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                    Work Orders
                </button>
                
                <button
                    onClick={() => setCurrentView('users')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <UserGroupIcon className="h-5 w-5 mr-3" />
                    Users Management
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
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {auth.user.name}</p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Pending Complaints" 
                    value={dashboardData?.stats?.pending_complaints || 0}
                    icon={ExclamationTriangleIcon}
                    color="yellow" 
                />
                <StatCard 
                    title="Pending Assignments" 
                    value={dashboardData?.stats?.pending_assignments || 0}
                    icon={ClockIcon}
                    color="orange" 
                />
                <StatCard 
                    title="Active Work Orders" 
                    value={dashboardData?.stats?.active_work_orders || 0}
                    icon={ClipboardDocumentListIcon}
                    color="blue" 
                />
                <StatCard 
                    title="Completed This Month" 
                    value={dashboardData?.stats?.completed_this_month || 0}
                    icon={CheckCircleIcon}
                    color="green" 
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h3>
                    <div className="space-y-3">
                        {dashboardData?.recent_complaints?.slice(0, 5).map((complaint) => (
                            <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{complaint.user?.name}</p>
                                    <p className="text-sm text-gray-600">{complaint.location}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentView('complaints')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View all complaints →
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Work Orders</h3>
                    <div className="space-y-3">
                        {dashboardData?.recent_work_orders?.slice(0, 5).map((workOrder) => (
                            <div key={workOrder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{workOrder.work_order_number}</p>
                                    <p className="text-sm text-gray-600">{workOrder.assigned_to_user?.name || 'Unassigned'}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(workOrder.status)}`}>
                                    {workOrder.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentView('work-orders')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View all work orders →
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'complaints':
                return <ComplaintsList />;
            case 'work-orders':
                return <WorkOrdersList />;
            case 'users':
                return <UsersList />;
            case 'reports':
                return <ReportsList />;
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
            <Head title="Admin Dashboard" />
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
}
