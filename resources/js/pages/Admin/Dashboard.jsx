import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import MobileSidebar from '@/components/MobileSidebar';
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
    BellIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard({ auth, dashboardData, viewData, currentView }) {
    const [mobileOpen, setMobileOpen] = useState(false);
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

    const navItems = [
        { key: 'dashboard',   label: 'Overview',     icon: HomeIcon },
        { key: 'complaints',  label: 'Complaints',   icon: ExclamationTriangleIcon },
        { key: 'work-orders', label: 'Work Orders',  icon: ClipboardDocumentListIcon },
        { key: 'users',       label: 'Users',        icon: UserGroupIcon },
        { key: 'reports',     label: 'Reports',      icon: ChartBarIcon },
    ];

    const Sidebar = () => (
        <div className="hidden md:flex md:w-64 md:flex-col md:h-screen md:fixed md:left-0 md:top-0 md:overflow-y-auto md:z-20 bg-[#0f172a]">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                    </svg>
                </div>
                <div>
                    <p className="text-white font-semibold text-sm leading-tight">WaterLog</p>
                    <p className="text-slate-400 text-xs">Admin Panel</p>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => navigateTo(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                            currentView === key
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {label}
                        {currentView === key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </button>
                ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {auth.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{auth.user.name}</p>
                        <p className="text-slate-500 text-xs truncate">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );

    

    const StatCard = ({ title, value, icon: Icon, accent = '#3b82f6', bg = '#eff6ff', textColor = '#1d4ed8' }) => (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-3xl font-bold" style={{ color: textColor }}>{value}</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: bg }}>
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
            </div>
        </div>
    );

    const DashboardView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Welcome back, <span className="font-medium text-slate-700">{auth.user.name}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Today</p>
                        <p className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <BellIcon className="h-5 w-5 text-slate-500" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Pending Complaints" value={dashboardData?.stats?.pending_complaints || 0} icon={ExclamationTriangleIcon} accent="#f59e0b" bg="#fffbeb" textColor="#b45309" />
                <StatCard title="Pending Assignments" value={dashboardData?.stats?.pending_assignments || 0} icon={ClockIcon} accent="#f97316" bg="#fff7ed" textColor="#c2410c" />
                <StatCard title="Active Work Orders" value={dashboardData?.stats?.active_work_orders || 0} icon={ClipboardDocumentListIcon} accent="#3b82f6" bg="#eff6ff" textColor="#1d4ed8" />
                <StatCard title="Completed This Month" value={dashboardData?.stats?.completed_this_month || 0} icon={CheckCircleIcon} accent="#10b981" bg="#ecfdf5" textColor="#065f46" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Recent Complaints</h3>
                        <button onClick={() => navigateTo('complaints')} className="text-xs text-blue-500 hover:text-blue-600 font-medium">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {dashboardData?.recent_complaints?.slice(0, 5).map((complaint) => (
                            <div key={complaint.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-bold">
                                        {complaint.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{complaint.user?.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{complaint.location}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium flex-shrink-0 ${getStatusBadge(complaint.status)}`}>{complaint.status?.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                        {(!dashboardData?.recent_complaints || dashboardData.recent_complaints.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No recent complaints</p>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Active Work Orders</h3>
                        <button onClick={() => navigateTo('work-orders')} className="text-xs text-blue-500 hover:text-blue-600 font-medium">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {dashboardData?.recent_work_orders?.slice(0, 5).map((workOrder) => (
                            <div key={workOrder.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-indigo-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{workOrder.work_order_number}</p>
                                        <p className="text-xs text-slate-400 truncate">{workOrder.assigned_to_user?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium flex-shrink-0 ${getStatusBadge(workOrder.status)}`}>{workOrder.status?.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                        {(!dashboardData?.recent_work_orders || dashboardData.recent_work_orders.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No active work orders</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'complaints':
                return <ComplaintsList complaints={viewData?.complaints || []} maintenanceStaff={viewData?.maintenanceStaff || []} />;
            case 'work-orders':
                return <WorkOrdersList workOrders={viewData?.workOrders || []} />;
            case 'users':
                return <UsersList users={viewData?.users || []} />;
            case 'reports':
                return <ReportsList reports={viewData?.reports || []} />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="md:overflow-x-hidden overflow-x-visible flex bg-slate-50 min-h-screen">
                <Sidebar />
                <div className="md:ml-64 ml-0 flex-1 flex flex-col">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setMobileOpen(true)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                            <span className="text-2xl">☰</span>
                        </button>
                        <div className="text-center flex-1">
                            <p className="text-sm font-semibold text-slate-800">Admin Dashboard</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                            {auth.user.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="flex-1 p-8 overflow-auto">
                        {renderCurrentView()}
                    </div>
                </div>
                <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} user={auth.user} onNavigate={(key) => navigateTo(key)} onLogout={handleLogout} />
            </div>
        </>
    );
}
