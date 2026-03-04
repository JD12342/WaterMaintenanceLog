import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function MaintenanceDashboard({ auth }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [taskHistory, setTaskHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const { data, setData, post, processing } = useForm({
        work_description: '',
        materials_used: '',
        hours_worked: '',
        completion_notes: '',
        work_quality: 'good'
    });

    useEffect(() => {
        loadDashboard();
        if (currentView === 'assigned-tasks') {
            loadAssignedTasks();
        } else if (currentView === 'task-history') {
            loadTaskHistory();
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

    const loadAssignedTasks = async () => {
        try {
            const response = await window.axios.get('/api/v1/work-orders');
            setAssignedTasks(response.data);
        } catch (error) {
            console.error('Error loading assigned tasks:', error);
        }
    };

    const loadTaskHistory = async () => {
        try {
            const response = await window.axios.get('/api/v1/maintenance-reports');
            setTaskHistory(response.data);
        } catch (error) {
            console.error('Error loading task history:', error);
        }
    };

    const handleLogout = () => {
        post('/logout');
    };

    const startWork = async (taskId) => {
        try {
            await window.axios.post(`/api/v1/work-orders/${taskId}/start-work`);
            loadAssignedTasks();
        } catch (error) {
            console.error('Error starting work:', error);
        }
    };

    const showCompletionDialog = (task) => {
        setSelectedTask(task);
        setShowReportModal(true);
        setData({
            work_description: '',
            materials_used: '',
            hours_worked: '',
            completion_notes: '',
            work_quality: 'good'
        });
    };

    const submitReport = async () => {
        if (!selectedTask) return;

        try {
            // First complete the work order
            await window.axios.post(`/api/v1/work-orders/${selectedTask.id}/complete-work`);
            
            // Then submit the maintenance report
            await window.axios.post('/api/v1/maintenance-reports', {
                work_order_id: selectedTask.id,
                ...data,
                materials_used: JSON.stringify(data.materials_used.split('\n').filter(item => item.trim())),
                work_started_at: selectedTask.updated_at,
                work_completed_at: new Date().toISOString()
            });
            
            setShowReportModal(false);
            loadAssignedTasks();
        } catch (error) {
            console.error('Error submitting report:', error);
        }
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

    const Sidebar = () => (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Maintenance</h1>
                <p className="text-sm text-gray-500">Field Operations</p>
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
                    onClick={() => setCurrentView('assigned-tasks')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'assigned-tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                    Assigned Tasks
                </button>
                
                <button
                    onClick={() => setCurrentView('task-history')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'task-history' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <ClockIcon className="h-5 w-5 mr-3" />
                    Task History
                </button>
                
                <button
                    onClick={() => setCurrentView('submit-report')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === 'submit-report' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <DocumentTextIcon className="h-5 w-5 mr-3" />
                    Submit Report
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
                    <h1 className="text-3xl font-bold text-gray-900">Maintenance Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {auth.user.name}</p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Assigned Tasks" 
                    value={dashboardData?.maintenance_stats?.assigned_tasks || 0}
                    icon={ClipboardDocumentListIcon}
                    color="blue" 
                />
                <StatCard 
                    title="In Progress" 
                    value={dashboardData?.maintenance_stats?.in_progress_tasks || 0}
                    icon={PlayIcon}
                    color="orange" 
                />
                <StatCard 
                    title="Completed This Month" 
                    value={dashboardData?.maintenance_stats?.completed_this_month || 0}
                    icon={CheckCircleIcon}
                    color="green" 
                />
                <StatCard 
                    title="Total Hours" 
                    value={dashboardData?.maintenance_stats?.total_hours_this_month || 0}
                    icon={ClockIcon}
                    color="purple" 
                />
            </div>

            {/* Active Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tasks</h3>
                    <div className="space-y-3">
                        {assignedTasks?.slice(0, 5).map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{task.work_order_number}</p>
                                    <p className="text-sm text-gray-600">{task.complaint?.location}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(task.status)}`}>
                                        {task.status}
                                    </span>
                                    {task.status === 'assigned' && (
                                        <button
                                            onClick={() => startWork(task.id)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <button
                                            onClick={() => showCompletionDialog(task)}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentView('assigned-tasks')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View all tasks →
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Completions</h3>
                    <div className="space-y-3">
                        {taskHistory?.slice(0, 5).map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{report.work_order?.work_order_number}</p>
                                    <p className="text-sm text-gray-600">{report.hours_worked}h • {new Date(report.work_completed_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    report.work_quality === 'excellent' ? 'bg-green-100 text-green-800' :
                                    report.work_quality === 'good' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {report.work_quality}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentView('task-history')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View full history →
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'assigned-tasks':
                return <AssignedTasks />;
            case 'task-history':
                return <TaskHistory />;
            case 'submit-report':
                return <SubmitReport />;
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
            <Head title="Maintenance Dashboard" />
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="ml-64 flex-1 p-8">
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
}
