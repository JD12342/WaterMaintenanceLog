import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AssignedTasks from './tasks/AssignedTasks';
import TaskHistory from './tasks/TaskHistory';
import SubmitReport from './reports/SubmitReport';
import { 
    HomeIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    PlayIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    WrenchScrewdriverIcon,
    BellIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function MaintenanceDashboard({ auth, dashboardData, viewData, currentView: serverView }) {
    const currentView = serverView || 'dashboard';
    const [selectedTask, setSelectedTask] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const { post } = useForm();
    const handleLogout = () => post('/logout');
    const navigateTo = (view) => router.get('/dashboard', { view }, { preserveScroll: true });

    // On overview (dashboard), tasks come from dashboardData; on sub-views, from viewData
    const assignedTasks = dashboardData?.my_work_orders || viewData?.tasks || [];
    const taskHistory = dashboardData?.completed_work_orders || viewData?.reports || [];

    const startWork = (taskId) => {
        router.post(`/dashboard/work-orders/${taskId}/start`, {}, {
            preserveScroll: true,
            onSuccess: () => navigateTo('assigned-tasks'),
        });
    };

    const showCompletionDialog = (task) => {
        setSelectedTask(task);
        setShowReportModal(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            assigned: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            verified: 'bg-emerald-100 text-emerald-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const navItems = [
        { key: 'dashboard',     label: 'Overview',       icon: HomeIcon },
        { key: 'assigned-tasks',label: 'Assigned Tasks', icon: ClipboardDocumentListIcon },
        { key: 'task-history',  label: 'Task History',   icon: ClockIcon },
        { key: 'submit-report', label: 'Submit Report',  icon: DocumentTextIcon },
    ];

    const Sidebar = () => (
        <div className="w-64 bg-[#0f172a] h-screen fixed left-0 top-0 flex flex-col overflow-y-auto z-20">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-white font-semibold text-sm leading-tight">WaterLog</p>
                    <p className="text-slate-400 text-xs">Maintenance</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => navigateTo(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                            currentView === key
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {label}
                        {currentView === key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    </button>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {auth.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{auth.user.name}</p>
                        <p className="text-slate-500 text-xs truncate">Field Staff</p>
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

    const StatCard = ({ title, value, icon: Icon, accent = '#14b8a6', bg = '#f0fdfa', textColor = '#0f766e' }) => (
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
            {/* Header */}
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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Assigned Tasks"
                    value={dashboardData?.maintenance_stats?.assigned_tasks || 0}
                    icon={ClipboardDocumentListIcon}
                    accent="#3b82f6" bg="#eff6ff" textColor="#1d4ed8"
                />
                <StatCard
                    title="In Progress"
                    value={dashboardData?.maintenance_stats?.in_progress_tasks || 0}
                    icon={PlayIcon}
                    accent="#f97316" bg="#fff7ed" textColor="#c2410c"
                />
                <StatCard
                    title="Completed This Month"
                    value={dashboardData?.maintenance_stats?.completed_this_month || 0}
                    icon={CheckCircleIcon}
                    accent="#10b981" bg="#ecfdf5" textColor="#065f46"
                />
                <StatCard
                    title="Hours This Month"
                    value={dashboardData?.maintenance_stats?.total_hours_this_month || 0}
                    icon={ClockIcon}
                    accent="#8b5cf6" bg="#f5f3ff" textColor="#6d28d9"
                />
            </div>

            {/* Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Active Tasks</h3>
                        <button onClick={() => navigateTo('assigned-tasks')} className="text-xs text-teal-500 hover:text-teal-600 font-medium">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {assignedTasks?.slice(0, 5).map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                        <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-teal-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{task.work_order_number}</p>
                                        <p className="text-xs text-slate-400 truncate">{task.complaint?.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadge(task.status)}`}>
                                        {task.status?.replace(/_/g, ' ')}
                                    </span>
                                    {task.status === 'assigned' && (
                                        <button
                                            onClick={() => startWork(task.id)}
                                            className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <button
                                            onClick={() => showCompletionDialog(task)}
                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!assignedTasks || assignedTasks.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No active tasks</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Recent Completions</h3>
                        <button onClick={() => navigateTo('task-history')} className="text-xs text-teal-500 hover:text-teal-600 font-medium">View history →</button>
                    </div>
                    <div className="space-y-2">
                        {taskHistory?.slice(0, 5).map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{report.work_order?.work_order_number}</p>
                                        <p className="text-xs text-slate-400">{report.hours_worked}h · {new Date(report.work_completed_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-3 ${
                                    report.work_quality === 'excellent' ? 'bg-emerald-50 text-emerald-600' :
                                    report.work_quality === 'good' ? 'bg-blue-50 text-blue-600' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {report.work_quality}
                                </span>
                            </div>
                        ))}
                        {(!taskHistory || taskHistory.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No completions yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'assigned-tasks':
                return <AssignedTasks tasks={viewData?.tasks || []} />;
            case 'task-history':
                return <TaskHistory reports={viewData?.reports || []} />;
            case 'submit-report':
                return <SubmitReport />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <>
            <Head title="Maintenance Dashboard" />
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
}
