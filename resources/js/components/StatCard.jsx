const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    trend = null,
    subtitle = null,
    onClick = null 
}) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        gray: 'bg-gray-100 text-gray-600'
    };

    const textColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        indigo: 'text-indigo-600',
        gray: 'text-gray-600'
    };

    const Component = onClick ? 'button' : 'div';
    
    return (
        <Component
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${
                onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
            }`}
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-2xl font-bold ${textColorClasses[color] || textColorClasses.blue}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center mt-2">
                            <span className={`text-xs font-medium ${
                                trend.direction === 'up' ? 'text-green-600' : 
                                trend.direction === 'down' ? 'text-red-600' : 
                                'text-gray-500'
                            }`}>
                                {trend.direction === 'up' ? '↗' : 
                                 trend.direction === 'down' ? '↘' : '→'}
                                {trend.value}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">{trend.label}</span>
                        </div>
                    )}
                </div>
            </div>
        </Component>
    );
};

export default StatCard;