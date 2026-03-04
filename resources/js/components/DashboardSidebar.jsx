import { 
    HomeIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    PlusIcon,
    ArrowRightOnRectangleIcon,
    UsersIcon,
    CogIcon,
    DocumentTextIcon,
    ChartBarIcon,
    WrenchScrewdriverIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const DashboardSidebar = ({ 
    user, 
    currentView, 
    setCurrentView, 
    title = "System Dashboard",
    subtitle = "Water Maintenance",
    menuItems = [],
    onLogout 
}) => {
    // Default menu items based on user role if not provided
    const getDefaultMenuItems = (role) => {
        switch (role) {
            case 'ADMIN':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                    { id: 'complaints', label: 'Complaints', icon: ExclamationTriangleIcon },
                    { id: 'users', label: 'Users', icon: UsersIcon },
                    { id: 'reports', label: 'Reports', icon: ChartBarIcon }
                ];
            
            case 'ENGINEERING':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                    { id: 'approvals', label: 'Approvals', icon: ClockIcon },
                    { id: 'work-orders', label: 'Work Orders', icon: DocumentTextIcon },
                    { id: 'reports', label: 'Reports', icon: ChartBarIcon }
                ];
            
            case 'MAINTENANCE':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                    { id: 'tasks', label: 'My Tasks', icon: WrenchScrewdriverIcon },
                    { id: 'reports', label: 'Reports', icon: DocumentTextIcon }
                ];
            
            case 'CONSUMER':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                    { id: 'complaints', label: 'My Complaints', icon: ExclamationTriangleIcon },
                    { id: 'submit', label: 'Submit Complaint', icon: PlusIcon, special: 'green' }
                ];
            
            default:
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon }
                ];
        }
    };

    const items = menuItems.length > 0 ? menuItems : getDefaultMenuItems(user?.role);

    return (
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            
            <nav className="p-4 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const specialColor = item.special || '';
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                                isActive 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : specialColor === 'green'
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </button>
                    );
                })}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                    {user && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                    )}
                    
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default DashboardSidebar;