import { Head } from '@inertiajs/react';

export default function Layout({ children, title = 'Water Maintenance Log' }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Water Maintenance System
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/api/health"
                                    className="text-gray-500 hover:text-gray-700"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    API Status
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                <main>{children}</main>
            </div>
        </>
    );
}