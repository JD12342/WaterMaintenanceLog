import { Head, useForm, router } from '@inertiajs/react';
import PendingApprovals from './approvals/PendingApprovals';
import ApprovedList from './approvals/ApprovedList';
import DeclinedList from './approvals/DeclinedList';
import EngineeringReportsList from './reports/ReportsList';
import {
    HomeIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    CogIcon,
    BellIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function EngineeringDashboard({ auth, dashboardData, viewData, currentView }) {
    const { post } = useForm();
    const handleLogout = () => post('/logout');
    const navigateTo = (view) => router.get('/dashboard', { view }, { preserveScroll: true });

    const navItems = [
        { key: 'dashboard',         label: 'Overview',          icon: HomeIcon },
        { key: 'pending-approvals', label: 'Pending Approvals', icon: ClockIcon },
        { key: 'approved',          label: 'Approved',          icon: CheckCircleIcon },
        { key: 'declined',          label: 'Declined',          icon: XMarkIcon },
        { key: 'reports',           label: 'Reports',           icon: ChartBarIcon },
    ];

    const Sidebar = () => (
        <div className="w-64 bg-[#0f172a] h-screen fixed left-0 top-0 flex flex-col overflow-y-auto z-20">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CogIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-white font-semibold text-sm leading-tight">WaterLog</p>
                    <p className="text-slate-400 text-xs">Engineering Dept</p>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => navigateTo(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                            currentView === key
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {label}
                        {currentView === key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>
                ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {auth.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{auth.user.name}</p>
                        <p className="text-slate-500 text-xs truncate">Engineer</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, accent = '#6366f1', bg = '#eef2ff', textColor = '#4338ca' }) => (
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
                    <p className="text-slate-500 text-sm mt-0.5">Review and approve maintenance requests</p>
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
                <StatCard title="Pending Reviews" value={dashboardData?.engineering_stats?.pending_reviews || 0} icon={ClockIcon} accent="#f59e0b" bg="#fffbeb" textColor="#b45309" />
                <StatCard title="Approved This Week" value={dashboardData?.engineering_stats?.approved_this_week || 0} icon={CheckCircleIcon} accent="#10b981" bg="#ecfdf5" textColor="#065f46" />
                <StatCard title="Declined This Week" value={dashboardData?.engineering_stats?.declined_this_week || 0} icon={XMarkIcon} accent="#ef4444" bg="#fef2f2" textColor="#b91c1c" />
                <StatCard title="Total Reviews" value={dashboardData?.engineering_stats?.total_reviews || 0} icon={CogIcon} accent="#6366f1" bg="#eef2ff" textColor="#4338ca" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Pending Reviews</h3>
                        <button onClick={() => navigateTo('pending-approvals')} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {dashboardData?.pending_complaints?.slice(0, 5).map((complaint) => (
                            <div key={complaint.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{complaint.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{complaint.location}</p>
                                </div>
                            </div>
                        ))}
                        {(!dashboardData?.pending_complaints || dashboardData.pending_complaints.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No pending reviews</p>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Recent Decisions</h3>
                    </div>
                    <div className="space-y-2">
                        {dashboardData?.engineering_recent_decisions?.slice(0, 5).map((decision) => (
                            <div key={decision.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{decision.complaint?.title}</p>
                                    <p className="text-xs text-slate-400">{decision.action} · {new Date(decision.reviewed_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-3 ${
                                    decision.action === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                }`}>{decision.action}</span>
                            </div>
                        ))}
                        {(!dashboardData?.engineering_recent_decisions || dashboardData.engineering_recent_decisions.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No recent decisions</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'pending-approvals':
                return <PendingApprovals complaints={viewData?.complaints || []} />;
            case 'approved':
                return <ApprovedList complaints={viewData?.complaints || []} />;
            case 'declined':
                return <DeclinedList complaints={viewData?.complaints || []} />;
            case 'reports':
                return <EngineeringReportsList reports={viewData?.reports || []} />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <>
            <Head title="Engineering Dashboard" />
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
}
